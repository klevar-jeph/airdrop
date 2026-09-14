import { NextResponse } from "next/server";
import { setupTelegramWebhook, getTelegramWebhookInfo } from "@/utils/telegram";

/**
 * Initialize Telegram webhook
 * GET /api/telegram/init
 *
 * Call this once after deployment to set up webhook
 */
export async function GET() {
  try {
    // Set up the webhook
    await setupTelegramWebhook();

    // Get webhook info
    const info = await getTelegramWebhookInfo();

    return NextResponse.json(
      {
        ok: true,
        message: "Telegram webhook initialized successfully",
        webhookInfo: info,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Initialization error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
