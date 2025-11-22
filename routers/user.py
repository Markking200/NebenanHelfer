import logging

from fastapi import APIRouter, status

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
