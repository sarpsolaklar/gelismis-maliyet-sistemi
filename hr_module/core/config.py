import os

class Settings:
    PROJECT_NAME: str = "HR Module API"
    # Testing quickly with SQLite to avoid PostgreSQL connection requirements
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hr_database.db")

settings = Settings()
