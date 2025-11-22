import logging

from fastapi import APIRouter, HTTPException, status

from backend.database import database, user_table
from backend.models.user import UserCreate, UserResponse

router = APIRouter()
logger = logging.getLogger(__name__)


# Register a new user
@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(user: UserCreate):
    """Register a new user (senior or student)"""
    query = user_table.insert().values(**user.model_dump())
    logger.debug(
        f"Executing query to register user: {query} with data: {user.model_dump()}"
    )
    last_record_id = await database.execute(query)
    return {
        **user.model_dump(),
        "id": last_record_id,
    }


# Get user by ID
@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """Retrieve user information by user ID"""
    query = user_table.select().where(user_table.c.id == user_id)
    logger.debug(f"Executing query to get user: {query}")
    user_record = await database.fetch_one(query)
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return UserResponse.model_validate(user_record)
