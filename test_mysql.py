import asyncio
import aiomysql

async def test_mysql():
    try:
        conn = await aiomysql.connect(
            host='brandpulse-database',
            port=3306,
            user='brandpulse_user',
            password='brandpulse_password',
            db='brandpulse'
        )
        print('Connected successfully to MySQL')
        
        cursor = await conn.cursor()
        await cursor.execute('SELECT 1 as test')
        result = await cursor.fetchone()
        print(f'Test query result: {result}')
        
        await cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f'MySQL connection failed: {e}')
        return False

if __name__ == "__main__":
    asyncio.run(test_mysql())









