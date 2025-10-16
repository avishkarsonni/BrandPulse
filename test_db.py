import asyncio
from databases import Database

async def test_connection():
    db = Database('mysql://brandpulse_user:brandpulse_password@brandpulse-database:3306/brandpulse')
    try:
        await db.connect()
        result = await db.fetch_one('SELECT 1 as test')
        print(f'Test result: {result}')
        await db.disconnect()
        return True
    except Exception as e:
        print(f'Connection failed: {e}')
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())









