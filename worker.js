export default {
  async fetch(request, env) {
    // CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight
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
        name = "",
        email = "",
        telegram = "",
        projects = "",
        budget = "",
        message = "",
      } = data;

      // Проверяем секреты
      if (!env.TELEGRAM_BOT_TOKEN) {
        console.error("TELEGRAM_BOT_TOKEN is missing");

        return new Response(
          JSON.stringify({
            success: false,
            error: "Telegram bot token is not configured",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      if (!env.TELEGRAM_CHAT_ID) {
        console.error("TELEGRAM_CHAT_ID is missing");

        return new Response(
          JSON.stringify({
            success: false,
            error: "Telegram chat ID is not configured",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      const telegramMessage = `
📩 <b>Новая заявка с Code &amp; Soul</b>

👤 <b>Имя:</b> ${escapeHtml(name)}
📧 <b>Email:</b> ${escapeHtml(email)}
📱 <b>Telegram:</b> ${escapeHtml(telegram)}
📌 <b>Проект:</b> ${escapeHtml(projects)}
💰 <b>Бюджет:</b> ${escapeHtml(budget)}

💬 <b>Сообщение:</b>
${escapeHtml(message)}
      `.trim();

      const telegramUrl =
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

      const telegramResponse = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: "HTML",
        }),
      });

      const telegramResult = await telegramResponse.text();

      console.log("Telegram response:", telegramResult);

      if (!telegramResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Telegram API error",
            details: telegramResult,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Application sent successfully",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      console.error("Worker error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal server error",
          details: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}