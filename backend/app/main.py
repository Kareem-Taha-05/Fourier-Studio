"""
FT Mixer & Emphasizer - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.images import router as images_router
from app.api.mixer import router as mixer_router
from app.api.emphasizer import router as emphasizer_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Fourier Transform Magnitude/Phase Mixer and Properties Emphasizer",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(images_router, prefix="/api/v1")
app.include_router(mixer_router, prefix="/api/v1")
app.include_router(emphasizer_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
