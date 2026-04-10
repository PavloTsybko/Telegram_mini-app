# BM Numbers — Anonymous Inbox System

NFT-based anonymous messaging system on TON blockchain.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your BOT_TOKEN

# Run bot
python3 bot.py

# Run API server
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000
```

## Bot Commands

- `/start` - Start
- `/my` - My numbers
- `/send +321 XXX XXXX <message>` - Send message
- `/send anon +321 XXX XXXX <message>` - Send anonymous
- `/inbox` - View messages

## API Endpoints

- `GET /api/numbers` - All numbers
- `GET /api/numbers/available` - Available numbers
- `POST /api/send` - Send message
- `GET /api/messages/{telegram_id}` - Get messages

## Architecture

- `app.py` - FastAPI backend + frontend server
- `bot.py` - Telegram bot
- `database.py` - SQLite database
- `docs/` - Built frontend (Mini App)
