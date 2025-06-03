import mysql.connector
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Set up connection
db = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

print("✅ Connected to Railway MySQL!")

# Optional: create a cursor to run queries
cursor = db.cursor()
cursor.execute("SHOW TABLES;")
for table in cursor:
    print(table)

# Remember to close when done
cursor.close()
db.close()
