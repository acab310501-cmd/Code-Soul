const ALLOWED_ORIGINS = [
  "https://acab310501-cmd.github.io",
  "http://localhost:5173",
  "http://localhost:5174",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
        ? origin
        : "https://acab310501-cmd.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Только POST
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const data = await request.json();

      const {
        name,
        email,
        telegram,
        projects,
        project,
        budget,
        message,
      } = data;

      // Поддерживаем оба варианта названия поля
      const projectList = projects || project || "Не указано";

      const telegramMessage = `
📩 Новая заявка с Code & Soul

👤 Имя: ${name || "Не указано"}
📧 Email: ${email || "Не указано"}
📱 Telegram: ${telegram || "Не указан"}
📌 Проект: ${projectList}
💰 Бюджет: ${budget || "Не указан"}

💬 Сообщение:
${message || "Не указано"}
      `.trim();

      const token = env.TELEGRAM_BOT_TOKEN;
      const chatId = env.TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        console.error("Missing Telegram environment variables");

        return new Response("Server misconfigured", {
          status: 500,
          headers: corsHeaders,
        });
      }

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
          }),
        }
      );

      if (!telegramResponse.ok) {
        const errorText = await telegramResponse.text();

        console.error("Telegram API error:", errorText);

        return new Response("Failed to send message", {
          status: 500,
          headers: corsHeaders,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Заявка успешно отправлена",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Worker error:", error);

      return new Response("Internal error", {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};