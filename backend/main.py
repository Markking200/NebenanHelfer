from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import database
from backend.routers.requests import router as requests_router
from backend.routers.user import router as user_router


# Turn on and shut down database connection with the app
@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()


# The lifespan function is passed to FastAPI to manage startup and shutdown events
app = FastAPI(lifespan=lifespan)

# Include routers for different API endpoints
app.include_router(requests_router, prefix="/api")
app.include_router(user_router, prefix="/api")

# Set up CORS middleware to allow requests from specified origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
