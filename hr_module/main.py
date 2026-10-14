import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from database import engine, Base
from routers import employee, leave, equipment, performance

# Create database tables (For production, use Alembic migrations instead)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gelişmiş İK Modülü API")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee.router)
app.include_router(leave.router)
app.include_router(equipment.router)
app.include_router(performance.router)

html_file = os.path.join(os.path.dirname(__file__), "frontend_demo.html")

@app.get("/")
def read_root():
    if os.path.exists(html_file):
        return FileResponse(html_file)
    return {"message": "İK Modülü API Sistemine Hoş Geldiniz!"}
