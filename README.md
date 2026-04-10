# Telegram Mini App + Bot

Backend for anonymous number messaging.

## Quick Deploy to VPS

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your BOT_TOKEN and ADMIN_IDS

# Run bot and API
pm2 start "python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload" --name uvicorn
```

## Nginx Config

Make sure nginx proxies to port 8000:
```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Files

- `app.py` — FastAPI server + Mini App UI
- `bot.py` — Telegram bot (aiogram)
- `database.py` — SQLite database
- `config.py` — Configuration
