import { Api } from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
}

const telegramApi = new Api(token);

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
    await telegramApi.deleteWebhook({ drop_pending_updates: true });
    console.log("Previous webhook deleted");

    // Set the new webhook
    await telegramApi.setWebhook({
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
    const info = await telegramApi.getWebhookInfo();
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
    await telegramApi.sendMessage(
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
    await telegramApi.sendMessage(
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
    await telegramApi.forwardMessage({
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
    await telegramApi.deleteWebhook({ drop_pending_updates: false });
    console.log("Telegram webhook deleted");
  } catch (error) {
    console.error("Error deleting webhook:", error);
    throw error;
  }
}

export default telegramApi;
