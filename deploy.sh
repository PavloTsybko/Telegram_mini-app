#!/bin/bash
# Deploy script for VPS

cd /var/www/www-root/data/www/bmnumbers.space

git pull origin main

# Install dependencies
pip install -r requirements.txt

# Build frontend
npm install
npm run build

# Restart services
pm2 delete all || true

# Start API server
pm2 start "python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload" --name api


# Start bot (in background)
pm2 start "python3 bot.py" --name bot

pm2 save

echo "✅ Deployed!"
