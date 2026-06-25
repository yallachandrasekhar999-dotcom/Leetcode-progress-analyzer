from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import profile, recommendations, compare, planner

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LeetCode Progress Analyzer API",
    description="Analyze LeetCode profiles, track progress, get recommendations, and generate study plans.",
    version="1.0.0",
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(profile.router)
app.include_router(recommendations.router)
app.include_router(compare.router)
app.include_router(planner.router)


@app.get("/")
def root():
    return {
        "message": "LeetCode Progress Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
