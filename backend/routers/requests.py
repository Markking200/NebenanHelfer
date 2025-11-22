import logging

from fastapi import APIRouter, status

from backend.database import database, requests_table
from backend.models import requests
from backend.models.requests import HelpRequestCreate, HelpRequestResponse

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
@router.get("/requests", response_model=list[HelpRequestResponse])
async def get_requests(status: requests.RequestStatus = requests.RequestStatus.OPEN):
    """Retrieve all requests, optionally filtered by status"""

    query = requests_table.select()

    if status:
        query = query.where(requests_table.c.status == status.value)

    logger.debug(f"Executing query to get requests: {query}")
    results = await database.fetch_all(query)
    return results
