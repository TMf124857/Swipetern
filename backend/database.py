import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./swipetern.db")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")

# Turso (libsql://) uses the libsql-experimental driver which requires
# a special connection URL format and auth token passed as a query param.
# Local development continues to use plain sqlite://.
if DATABASE_URL.startswith("libsql://"):
    # Convert libsql:// → https:// for the SQLAlchemy dialect URL
    # and embed the auth token so the driver can authenticate.
    _url = DATABASE_URL.replace("libsql://", "https://", 1)
    _connect_url = f"sqlite+libsql:///{_url}?authToken={TURSO_AUTH_TOKEN}&secure=true"
    engine = create_engine(_connect_url, connect_args={})
else:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    # Enable foreign keys for SQLite (not required for Turso — enforced server-side)
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
