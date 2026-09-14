import { Api } from "node-telegram-bot-api";

const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

// Lazily instantiated so the module can be imported without crashing
// at build/static-generation time when env vars may not be present.
let _api: Api | null = null;
function getApi(): Api {
  if (!_api) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
    }
    _api = new Api(token);
  }
  return _api;
}

/**
 * Set up the Telegram webhook
 * Call this once during bot initialization
 */
export async function setupTelegramWebhook() {
  if (!webhookUrl) {
    console.warn("TELEGRAM_WEBHOOK_URL not set. Webhook setup skipped.");
    return;
  }

  try {
    // Remove any existing webhook first
    await getApi().deleteWebhook({ drop_pending_updates: true });
    console.log("Previous webhook deleted");

    // Set the new webhook
    await getApi().setWebhook({
      url: webhookUrl,
      allowed_updates: ["message", "edited_message", "callback_query"],
    });

    console.log("✅ Telegram webhook set up successfully at:", webhookUrl);
  } catch (error) {
    console.error("Error setting up Telegram webhook:", error);
    throw error;
  }
}

/**
 * Get webhook info
 */
export async function getTelegramWebhookInfo() {
  try {
    const info = await getApi().getWebhookInfo();
    return info;
  } catch (error) {
    console.error("Error getting webhook info:", error);
    throw error;
  }
}

/**
 * Send a message to a specific chat
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: any
) {
  try {
    await getApi().sendMessage(
      {
        chat_id: chatId,
        text,
        ...options,
      },
      options
    );
    console.log("Message sent to chat", chatId);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

/**
 * Send keyboard buttons to user
 */
export async function sendTelegramKeyboard(
  chatId: string | number,
  text: string,
  buttons: string[][]
) {
  try {
    const keyboard = buttons.map((row) => row.map((label) => ({ text: label })));
    await getApi().sendMessage(
      {
        chat_id: chatId,
        text,
        reply_markup: {
          keyboard,
          resize_keyboard: true,
        },
      },
      undefined
    );
    console.log("Keyboard sent to chat", chatId);
  } catch (error) {
    console.error("Error sending keyboard:", error);
    throw error;
  }
}

/**
 * Forward message to admin chat
 */
export async function forwardToAdmin(
  fromChatId: number,
  messageId: number,
  toChatId: string | number
) {
  try {
    await getApi().forwardMessage({
      chat_id: toChatId,
      from_chat_id: fromChatId,
      message_id: messageId,
    });
    console.log("Message forwarded to admin");
  } catch (error) {
    console.error("Error forwarding message:", error);
    throw error;
  }
}

/**
 * Delete webhook (for polling fallback)
 */
export async function deleteTelegramWebhook() {
  try {
    await getApi().deleteWebhook({ drop_pending_updates: false });
    console.log("Telegram webhook deleted");
  } catch (error) {
    console.error("Error deleting webhook:", error);
    throw error;
  }
}

export default getApi;
