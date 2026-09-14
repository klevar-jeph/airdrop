import { NextResponse } from "next/server";
import { messageStore, type TelegramMessage } from "@/lib/telegramStore";

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();

    if (!update.update_id) {
      return NextResponse.json(
        { error: "Invalid update format" },
        { status: 400 }
      );
    }

    const message = update.message || update.edited_message;

    if (!message) {
      // Acknowledging the update even if it's not a message
      return NextResponse.json(
        { ok: true, message: "Update received" },
        { status: 200 }
      );
    }

    // Store the message
    messageStore.push(message);

    // Log the received message
    console.log("📨 New Telegram message received:", {
      from: message.from?.username || message.from?.first_name || "Unknown",
      chat_id: message.chat.id,
      text: message.text || "[Media or other content]",
      timestamp: new Date(message.date * 1000).toISOString(),
    });

    // Process the message
    await processMessage(message);

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json(
      { ok: true, message: "Update received and processed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    // Return 200 to prevent Telegram from retrying
    return NextResponse.json(
      { ok: true, error: "Processing failed but acknowledged" },
      { status: 200 }
    );
  }
}

// Handle GET requests (health check)
export async function GET() {
  return NextResponse.json(
    { 
      ok: true, 
      message: "Telegram webhook is running",
      messagesReceived: messageStore.length 
    },
    { status: 200 }
  );
}

async function processMessage(message: TelegramMessage) {
  // You can add custom message processing logic here
  // Examples:
  // - Parse wallet commands
  // - Extract airdrop requests
  // - Forward to admin notifications
  // - Update user database

  if (message.text) {
    // Example: handle /start command
    if (message.text.startsWith("/start")) {
      console.log("User started the bot:", message.from?.username);
    }

    // Example: handle /wallet command
    if (message.text.startsWith("/wallet")) {
      console.log("Wallet command received:", message.text);
    }
  }
}

