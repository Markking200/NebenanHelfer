import databases
import sqlalchemy

from backend.config import config

# Using Encode Database for async database connections


# ----- Create database schema and engine -----
metadata = sqlalchemy.MetaData()

requests_table = sqlalchemy.Table(
    "requests",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("title", sqlalchemy.String),
    sqlalchemy.Column("address", sqlalchemy.String),
    sqlalchemy.Column("details", sqlalchemy.String),
    sqlalchemy.Column("user_id", sqlalchemy.ForeignKey("users.id"), nullable=False),
    sqlalchemy.Column("student_id", sqlalchemy.ForeignKey("users.id"), nullable=True),
    sqlalchemy.Column(
        "created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()
    ),
    sqlalchemy.Column("status", sqlalchemy.String, server_default="open"),
    sqlalchemy.Column("current_contact_number", sqlalchemy.String),
    sqlalchemy.Column("target_date", sqlalchemy.String, nullable=True),
)

# User table
user_table = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("full_name", sqlalchemy.String),
    sqlalchemy.Column("phone", sqlalchemy.String),
    sqlalchemy.Column("email", sqlalchemy.String, unique=True),
    sqlalchemy.Column("password", sqlalchemy.String),
    sqlalchemy.Column("user_type", sqlalchemy.String),  # 'senior' or 'student'
    sqlalchemy.Column("address", sqlalchemy.String),
)

# Create the database engine
engine = sqlalchemy.create_engine(
    # Use connect_args for SQLite to avoid threading issues
    config.DATABASE_URL,
    connect_args={"check_same_thread": False},
)

metadata.create_all(engine)

# Using encode/databases for interacting with the database asynchronously
database = databases.Database(
    config.DATABASE_URL, force_rollback=config.DB_FORCE_ROLL_BACK
)
