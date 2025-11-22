from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserType(str, Enum):
    SENIOR = "senior"
    STUDENT = "student"


# ----- User models -----
class UserBase(BaseModel):
    email: EmailStr
    phone: str = Field(..., description="Primary Contact Number")
    address: str
    full_name: str
    user_type: UserType


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)  # For ORM compatibility
