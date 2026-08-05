export default {
  async fetch(request, env) {
    // Только POST-запросы
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { name, email, telegram, projects, budget, message } = await request.json();

      const telegramMessage = `
<b>📩 Новая заявка с Code & Soul</b>

<b>👤 Имя:</b> ${name}
<b>📧 Email:</b> ${email}
<b>📱 Telegram:</b> ${telegram}
<b>📌 Проект:</b> ${projects}
<b>💰 Бюджет:</b> ${budget}
<b>💬 Сообщение:</b>
${message}
      `.trim();

      const token = env.TELEGRAM_BOT_TOKEN;
      const chatId = env.TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        return new Response('Server misconfigured', { status: 500 });
      }

      const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: telegramMessage, parse_mode: 'HTML' })
      });

      if (!telegramResponse.ok) {
        const errorText = await telegramResponse.text();
        console.error('Telegram API error:', errorText);
        return new Response('Failed to send message', { status: 500 });
      }

      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal error', { status: 500 });
    }
  }
};