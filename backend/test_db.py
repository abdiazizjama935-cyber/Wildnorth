import os
from sqlalchemy import create_engine

base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, 'instance', 'wildnorth.db')
db_uri = f'sqlite:////{db_path}'

print(f"Path: {db_path}")
print(f"URI : {db_uri}")

try:
    engine = create_engine(db_uri)
    conn = engine.connect()
    print("✅ Connection successful")
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")