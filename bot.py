import asyncio
import os
from aiogram import Bot, Dispatcher, Router, types
from aiogram.filters import Command
from aiogram.types import Message, FSInputFile
from aiogram.client.default import DefaultBotProperties
from dotenv import load_dotenv

import database as db


load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# Bot setup
bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode="HTML"))
router = Router()


async def ensure_user(user: types.User):
    """Ensure user exists in database"""
    existing = await db.get_user(user.id)
    if not existing:
        await db.create_user(user.id, user.username)


@router.message(Command("start"))
async def cmd_start(message: Message):
    """Handle /start command"""
    await ensure_user(message.from_user)
    user = message.from_user
    
    await message.answer(
        "🎉 <b>Welcome to BM Numbers!</b>\n\n"
        "Your anonymous inbox system on TON.\n\n"
        "<b>Commands:</b>\n"
        "• /start - Start\n"
        "• /my - My numbers\n"
        "• /send &lt;number&gt; - Send message\n"
        "• /inbox - View messages\n\n"
        "🌐 Website: https://bmnumbers.space"
    )



@router.message(Command("my"))
async def cmd_my(message: Message):
    """Handle /my command - show user's numbers"""
    await ensure_user(message.from_user)
    user_data = await db.get_user(message.from_user.id)
    
    if not user_data:
        await message.answer("❌ User not found. Use /start first.")
        return
    
    numbers = await db.get_user_numbers(user_data['id'])
    
    if not numbers:
        await message.answer(
            "📦 <b>You don't own any numbers yet!</b>\n\n"
            "Visit https://bmnumbers.space to mint your first number!"
        )
        return
    
    text = "📦 <b>Your Numbers:</b>\n\n"
    for n in numbers:
        text += f"• <code>{n['number']}</code> ({n['tier']})\n"
    
    await message.answer(text)


@router.message(Command("inbox"))
async def cmd_inbox(message: Message):
    """Handle /inbox command - show messages"""
    await ensure_user(message.from_user)
    user_data = await db.get_user(message.from_user.id)
    
    if not user_data:
        await message.answer("❌ User not found. Use /start first.")
        return
    
    numbers = await db.get_user_numbers(user_data['id'])
    
    if not numbers:
        await message.answer("❌ You don't own any numbers.")
        return
    
    all_messages = []
    for n in numbers:
        msgs = await db.get_messages(n['number'])
        all_messages.extend(msgs)
    
    if not all_messages:
        await message.answer("📭 <b>No messages yet!</b>")
        return
    
    text = "📬 <b>Your Messages:</b>\n\n"
    for msg in all_messages[:10]:
        sender = "Anonymous 🔐" if msg['is_anonymous'] else f"@{message.from_user.username}"
        text += f"<b>From:</b> {sender}\n"
        text += f"<b>To:</b> {msg['to_number']}\n"
        text += f"<b>Message:</b> {msg['message'][:100]}\n"
        text += "─" * 15 + "\n"
    
    await message.answer(text)


@router.message(Command("send"))
async def cmd_send(message: Message):
    """Handle /send command"""
    await ensure_user(message.from_user)
    
    parts = message.text.split(maxsplit=2)
    if len(parts) < 3:
        await message.answer(
            "📤 <b>Send a message</b>\n\n"
            "Usage: /send +321 XXX XXXX <message>\n\n"
            "Example: /send +321 414 1212 Hello!\n\n"
            "For anonymous: add 'anon' prefix\n"
            "Example: /send anon +321 414 1212 Secret message"
        )
        return
    
    # Check for anonymous mode
    is_anonymous = False
    if parts[1].lower() == "anon":
        is_anonymous = True
        number = parts[2].split(maxsplit=1)[0]
        msg_text = parts[2].split(maxsplit=1)[1] if len(parts[2].split(maxsplit=1)) > 1 else ""
    else:
        number = parts[1]
        msg_text = parts[2]
    
    # Validate number format
    if not number.startswith("+321 "):
        await message.answer("❌ Invalid number. Use format: +321 XXX XXXX")
        return
    
    # Check if number exists
    owner_id = await db.get_number_owner(number)
    if not owner_id:
        await message.answer("❌ This number doesn't exist or is not minted yet.")
        return
    
    # Get owner info
    owner = await db.get_user_by_id(owner_id)
    if not owner:
        await message.answer("❌ Owner not found.")
        return
    
    # Save message
    from_telegram = f"@{message.from_user.username}" if message.from_user.username else f"ID:{message.from_user.id}"
    await db.save_message(from_telegram, number, msg_text, is_anonymous)
    
    # Send to owner
    try:
        if is_anonymous:
            await bot.send_message(
                owner['telegram_id'],
                "📨 <b>New Anonymous Message!</b>\n\n"
                f"<b>From:</b> Anonymous 🔐\n"
                f"<b>Number:</b> {number}\n"
                f"<b>Message:</b> {msg_text}"
            )
        else:
            await bot.send_message(
                owner['telegram_id'],
                "📨 <b>New Message!</b>\n\n"
                f"<b>From:</b> {from_telegram}\n"
                f"<b>Number:</b> {number}\n"
                f"<b>Message:</b> {msg_text}"
            )
        await message.answer(f"✅ Message sent to {number}!")
    except Exception as e:
        await message.answer(f"⚠️ Message saved but couldn't notify owner: {e}")


@router.message()
async def handle_text(message: Message):
    """Handle any text message"""
    await ensure_user(message.from_user)
    await message.answer(
        "👋 Use commands:\n"
        "• /start - Start\n"
        "• /my - My numbers\n"
        "• /send - Send message\n"
        "• /inbox - Messages"
    )


async def main():
    """Run bot"""
    # Initialize database
    await db.init_db()
    
    # Register router
    dp = Dispatcher()
    dp.include_router(router)
    
    print("🤖 Bot starting...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
