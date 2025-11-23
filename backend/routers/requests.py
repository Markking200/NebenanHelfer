import logging

import sqlalchemy
from fastapi import APIRouter, HTTPException, status

from backend.database import database, requests_table, user_table
from backend.models import requests
from backend.models.requests import (
    HelpRequestCreate,
    HelpRequestResponse,
    HelpRequestResponseWithUser,
    HelpRequestUpdate,
)
from backend.models.user import UserType
from backend.routers.user import get_user

router = APIRouter()

# Set up logging
logger = logging.getLogger(__name__)


async def find_request(request_id: int):
    query = requests_table.select().where(requests_table.c.id == request_id)
    logger.debug(f"Executing query to find request: {query}")
    return await database.fetch_one(query)


@router.post(
    "/request",
    response_model=HelpRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_request(request: HelpRequestCreate):
    """Create a new request associated with a senior user"""
    data = {**request.model_dump()}

    # Only senior users can create requests
    user = await get_user(data["user_id"])
    if user.user_type != UserType.SENIOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only senior users can create requests",
        )

    query = requests_table.insert().values(data)

    logger.debug(f"Executing query to create request: {query} with data: {data}")
    last_record_id = await database.execute(query)
    created_at = await database.fetch_one(
        requests_table.select().where(requests_table.c.id == last_record_id)
    )
    return {
        **data,
        "status": requests.RequestStatus.OPEN,
        "created_at": created_at["created_at"],  # type: ignore
        "id": last_record_id,
    }


# Using Enum for request status filtering
# Get list of requests, with optional filtering by status
# Returns also user name and contact number
@router.get("/requests", response_model=list[HelpRequestResponseWithUser])
async def get_requests(status: requests.RequestStatus | None = None):
    """Retrieve all requests, optionally filtered by status"""

    query = sqlalchemy.select(
        requests_table,
        user_table.c.full_name.label("user_full_name"),
        user_table.c.phone.label("user_contact_number"),
    ).select_from(
        requests_table.join(user_table, requests_table.c.user_id == user_table.c.id)
    )

    if status:
        query = query.where(requests_table.c.status == status.value)

    else:
        query = query.select()

    logger.debug(f"Executing query to get requests: {query}")
    results = await database.fetch_all(query)
    return results


# update request when a student select to help
@router.put("/request/{request_id}", response_model=HelpRequestResponse)
async def update_request(request_id: int, request: HelpRequestUpdate):
    """Update a help request's status and assigned student"""
    existing_request = await find_request(request_id)
    if not existing_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Request not found"
        )

    # Get student user_id
    user = await get_user(request.user_id)
    if user.user_type != UserType.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only student users can accept requests",
        )
    update_data = request.model_dump(exclude_unset=True)

    # Transform user_id into student_id in the requests table
    update_data["student_id"] = update_data.pop("user_id")

    query = (
        requests_table.update()
        .where(requests_table.c.id == request_id)
        .values(**update_data)
    )
    logger.debug(f"Executing query to update request: {query} with data: {update_data}")
    await database.execute(query)
    updated_request = await find_request(request_id)
    return updated_request
