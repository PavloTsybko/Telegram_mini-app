#!/bin/bash
# Deploy script for VPS

cd /var/www/www-root/data/www/bmnumbers.space

git pull origin main

pip install -r requirements.txt

pm2 delete all || true
pm2 start "python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload" --name uvicorn

pm2 save