from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, get_db
from .models import User, FeedType, Reservation, Notification
from .routers import auth, feed, reservations, admin, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    from .migrate_db import migrate
    migrate()
    # Ensure upload directory exists
    from .config import settings
    import os
    os.makedirs(settings.receipt_upload_dir, exist_ok=True)
    yield


app = FastAPI(
    title="Feed Management & Reservation API",
    description="Reservation and sale of animal feed with bank transfer and admin approval.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(feed.router)
app.include_router(reservations.router)
app.include_router(admin.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"app": "Feed Management & Reservation", "docs": "/docs"}


@app.get("/health")
def health():
    """Used by frontend to check if backend is reachable."""
    return {"ok": True}
