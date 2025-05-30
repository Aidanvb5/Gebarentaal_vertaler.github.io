import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv()  

def execute_sql_scripts(connection, script_path):
    try:
        with open(script_path, 'r') as file:
            sql_script = file.read()

        # Split script into individual statements by ';'
        statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]
        cursor = connection.cursor()

        for statement in statements:
            try:
                cursor.execute(statement)
            except Error as e:
                print(f"Error executing statement:\n{statement}\n{e}")

        connection.commit()
        print("SQL script executed successfully.")
    except Exception as e:
        print(f"Error reading or executing script {script_path}: {e}")

def main():
    host = 'mysql-3bbe49f4-handtrackerdb.l.aivencloud.com'
    port = 24891
    user = 'avnadmin'
    password = os.getenv("AIVEN_PASSWORD")  # ✅ This now works after load_dotenv()
    database_name = 'HandTrackerDB'
    create_database_script = 'create-query.sql'

    try:
        # Initial connection without selecting a database
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password
        )

        if connection.is_connected():
            print("Connected to MySQL Server")
            execute_sql_scripts(connection, create_database_script)
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
    finally:
        if connection.is_connected():
            connection.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    main()
