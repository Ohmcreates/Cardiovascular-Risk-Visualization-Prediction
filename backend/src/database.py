"""
CardioVision 3D - Database Engine & Session Management
High-performance SQLite / PostgreSQL SQLAlchemy configuration with WAL mode and connection pooling.
"""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

# Database URL configuration: defaults to local persistent SQLite in backend/data/
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_SQLITE_PATH = os.path.join(DATA_DIR, "cardiovision.db")

# In Vercel Serverless environment, fallback to /tmp/ for SQLite writes
if os.getenv("VERCEL") or (os.path.exists(DATA_DIR) and not os.access(DATA_DIR, os.W_OK)):
    import shutil
    tmp_db = "/tmp/cardiovision.db"
    if not os.path.exists(tmp_db) and os.path.exists(DEFAULT_SQLITE_PATH):
        try:
            shutil.copy2(DEFAULT_SQLITE_PATH, tmp_db)
        except Exception as e:
            print(f"Notice: /tmp db copy exception: {e}")
    DEFAULT_SQLITE_PATH = tmp_db

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

# Configure SQLite for production concurrency (WAL mode & foreign keys)
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency for yielding database session with automatic cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
