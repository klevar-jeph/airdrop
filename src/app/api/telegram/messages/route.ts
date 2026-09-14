import { NextResponse } from "next/server";
import { messageStore } from "../webhook/route";

/**
 * Get all received messages (for testing/admin)
 * GET /api/telegram/messages
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");

    // Return last N messages
    const messages = messageStore.slice(-limit);

    return NextResponse.json(
      {
        ok: true,
        total: messageStore.length,
        returned: messages.length,
        messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}
