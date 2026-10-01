from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.analyzer.analyse import router as analyze_router
from app.api.explain import router as explain_router


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="SECURECODE AI",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

@app.on_event("startup")
def create_tables():

    Base.metadata.create_all(
        bind=engine
    )


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    analyze_router
)

app.include_router(
    explain_router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "SECURECODE AI API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "ok"
    }