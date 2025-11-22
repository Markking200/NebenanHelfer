from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

# ConfigDict is used for Pydantic v2 compatibility
# it also allows for future configuration options if needed


# ----- Request models -----


class RequestStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# Base class for request models
class HelpRequestBase(BaseModel):
    title: str = Field(
        ..., description="Short summary, e.g. 'Need help with groceries'"
    )
    details: str = Field(..., description="Full transcription from the AI")
    address: str = Field(..., description="Location of the senior")
    current_contact_number: str = Field(..., description="Phone number of the senior")


# Input Schema
class HelpRequestCreate(HelpRequestBase):
    user_id: int
    model_config = ConfigDict(from_attributes=True)  # For ORM compatibility
    pass


# Update Schema
class HelpRequestUpdate(BaseModel):
    user_id: int
    status: Optional[RequestStatus] = None
    model_config = ConfigDict(from_attributes=True)  # For ORM compatibility


# Output Schema
class HelpRequestResponse(HelpRequestBase):
    id: int
    user_id: int
    created_at: datetime
    status: Optional[RequestStatus] = None
    student_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)  # For ORM compatibility
