import os
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import database as db

load_dotenv()

app = FastAPI(title="BM Numbers API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Serve static files from docs (built frontend)
static_path = Path(__file__).parent / "docs"
if static_path.exists():
    app.mount("/", StaticFiles(directory=str(static_path), html=True), name="static")


# Models
class SendMessageRequest(BaseModel):
    to_number: str
    message: str
    is_anonymous: bool = False
    from_telegram: str = None


class MintRequest(BaseModel):
    number: str
    telegram_id: int


# API Routes
@app.get("/api/numbers")
async def get_numbers():
    """Get all available numbers"""
    numbers = await db.get_all_numbers()
    return JSONResponse(content=numbers)


@app.get("/api/numbers/available")
async def get_available():
    """Get available numbers"""
    numbers = await db.get_available_numbers()
    return JSONResponse(content=numbers)


@app.get("/api/user/{telegram_id}")
async def get_user(telegram_id: int):
    """Get user by telegram ID"""
    user = await db.get_user(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return JSONResponse(content=user)


@app.post("/api/user")
async def create_user(request: Request):
    """Create or update user"""
    data = await request.json()
    telegram_id = data.get("telegram_id")
    username = data.get("username")
    wallet_address = data.get("wallet_address")
    
    if not telegram_id:
        raise HTTPException(status_code=400, detail="telegram_id required")
    
    await db.create_user(telegram_id, username, wallet_address)
    return JSONResponse(content={"status": "ok"})


@app.get("/api/user/{telegram_id}/numbers")
async def get_user_numbers(telegram_id: int):
    """Get user's numbers"""
    user = await db.get_user(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    numbers = await db.get_user_numbers(user['id'])
    return JSONResponse(content=numbers)


@app.post("/api/mint")
async def mint_number(request: Request):
    """Mint a number to user"""
    data = await request.json()
    number = data.get("number")
    telegram_id = data.get("telegram_id")
    
    if not number or not telegram_id:
        raise HTTPException(status_code=400, detail="number and telegram_id required")
    
    user = await db.get_user(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.mint_number(number, user['id'])
    return JSONResponse(content={"status": "minted", "number": number})


@app.post("/api/send")
async def send_message(request: Request):
    """Send a message to a number"""
    data = await request.json()
    to_number = data.get("to_number")
    message = data.get("message")
    is_anonymous = data.get("is_anonymous", False)
    from_telegram = data.get("from_telegram", "Anonymous")
    
    if not to_number or not message:
        raise HTTPException(status_code=400, detail="to_number and message required")
    
    # Check if number exists
    owner_id = await db.get_number_owner(to_number)
    if not owner_id:
        raise HTTPException(status_code=404, detail="Number not found or not minted")
    
    # Calculate payment (50% to owner, 50% to platform)
    amount_paid = 0.5 if is_anonymous else 0
    
    # Save message
    msg_id = await db.save_message(from_telegram, to_number, message, is_anonymous, amount_paid)
    
    return JSONResponse(content={
        "status": "sent",
        "message_id": msg_id,
        "is_anonymous": is_anonymous,
        "amount": amount_paid
    })


@app.get("/api/messages/{telegram_id}")
async def get_messages(telegram_id: int):
    """Get messages for user's numbers"""
    user = await db.get_user(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    numbers = await db.get_user_numbers(user['id'])
    all_messages = []
    
    for n in numbers:
        msgs = await db.get_messages(n['number'])
        all_messages.extend(msgs)
    
    return JSONResponse(content=all_messages)


@app.get("/api/health")
async def health():
    """Health check"""
    return {"status": "ok"}


# Initialize database on startup
@app.on_event("startup")
async def startup():
    await db.init_db()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
