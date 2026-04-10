import aiosqlite
import asyncio
from datetime import datetime
from typing import Optional

DB_PATH = "bmnumbers.db"


async def init_db():
    """Initialize database tables"""
    async with aiosqlite.connect(DB_PATH) as db:
        # Users table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id INTEGER UNIQUE NOT NULL,
                username TEXT,
                wallet_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Numbers table (NFTs)
        await db.execute('''
            CREATE TABLE IF NOT EXISTS numbers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number TEXT UNIQUE NOT NULL,
                tier TEXT NOT NULL,
                style TEXT,
                identity TEXT,
                rarity TEXT,
                price REAL NOT NULL,
                owner_id INTEGER,
                minted BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id)
            )
        ''')

        # Messages table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_number TEXT NOT NULL,
                to_number TEXT NOT NULL,
                message TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT 0,
                amount_paid REAL DEFAULT 0,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Insert sample numbers if not exists
        await db.execute('''
            INSERT OR IGNORE INTO numbers (number, tier, style, identity, rarity, price)
            VALUES 
                ('+321 102 3847', 'Basic', 'Black Minimal', 'Anonymous', 'Common', 0.5),
                ('+321 178 4421', 'Basic', 'Neon Blue', 'Builder', 'Common', 0.7),
                ('+321 325 9983', 'Basic', 'Black Minimal', 'Anonymous', 'Common', 0.5),
                ('+321 414 1212', 'Pattern', 'Matrix Green', 'Hacker', 'Uncommon', 1.5),
                ('+321 464 5656', 'Pattern', 'Purple NFT', 'Creator', 'Uncommon', 2.0),
                ('+321 515 5151', 'Pattern', 'Matrix Green', 'Hacker', 'Uncommon', 2.5),
                ('+321 600 1111', 'Repeat', 'Red Aggressive', 'Trader', 'Rare', 4.0),
                ('+321 655 6666', 'Repeat', 'Purple NFT', 'Degenerate', 'Rare', 5.0),
                ('+321 699 9999', 'Repeat', 'Red Aggressive', 'Trader', 'Rare', 6.0),
                ('+321 800 0000', 'Premium', 'Gold Premium', 'Investor', 'Epic', 15.0),
                ('+321 888 8888', 'Premium', 'Ice Blue', 'Whale', 'Epic', 20.0),
                ('+321 999 0000', 'Premium', 'Gold Premium', 'Investor', 'Epic', 18.0),
                ('+321 000 0000', 'Legendary', 'Rainbow Rare', 'Unique', 'Legendary', 100.0),
                ('+321 111 1111', 'Legendary', 'Rainbow Rare', 'Unique', 'Legendary', 120.0),
                ('+321 321 3210', 'Legendary', 'Rainbow Rare', 'Unique', 'Legendary', 80.0)
            ''')
        )

        await db.commit()


async def get_user(telegram_id: int) -> Optional[dict]:
    """Get user by telegram ID"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            'SELECT * FROM users WHERE telegram_id = ?', (telegram_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def create_user(telegram_id: int, username: str = None, wallet_address: str = None) -> int:
    """Create new user"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            'INSERT OR REPLACE INTO users (telegram_id, username, wallet_address) VALUES (?, ?, ?)',
            (telegram_id, username, wallet_address)
        )
        await db.commit()
        return telegram_id


async def get_all_numbers() -> list:
    """Get all numbers"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute('SELECT * FROM numbers ORDER BY price') as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def get_available_numbers() -> list:
    """Get available (not minted) numbers"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute('SELECT * FROM numbers WHERE minted = 0 ORDER BY price') as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def get_user_numbers(owner_id: int) -> list:
    """Get numbers owned by user"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            'SELECT * FROM numbers WHERE owner_id = ?', (owner_id,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def mint_number(number: str, owner_id: int) -> bool:
    """Mint a number to user"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            'UPDATE numbers SET owner_id = ?, minted = 1 WHERE number = ? AND minted = 0',
            (owner_id, number)
        )
        await db.commit()
        return True


async def get_number_owner(number: str) -> Optional[int]:
    """Get owner ID of a number"""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            'SELECT owner_id FROM numbers WHERE number = ? AND minted = 1', (number,)
        ) as cursor:
            row = await cursor.fetchone()
            return row[0] if row else None


async def save_message(from_number: str, to_number: str, message: str, 
                       is_anonymous: bool = False, amount_paid: float = 0) -> int:
    """Save a message"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            '''INSERT INTO messages (from_number, to_number, message, is_anonymous, amount_paid, status)
               VALUES (?, ?, ?, ?, ?, 'delivered')''',
            (from_number, to_number, message, is_anonymous, amount_paid)
        )
        await db.commit()
        async with db.execute('SELECT last_insert_rowid()') as cursor:
            row = await cursor.fetchone()
            return row[0]


async def get_messages(to_number: str) -> list:
    """Get messages for a number"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            'SELECT * FROM messages WHERE to_number = ? ORDER BY created_at DESC', 
            (to_number,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def get_user_by_id(user_id: int) -> Optional[dict]:
    """Get user by ID"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute('SELECT * FROM users WHERE id = ?', (user_id,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None
