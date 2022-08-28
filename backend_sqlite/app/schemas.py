from datetime import datetime
from typing import List, Optional
import uuid

from fastapi_users import schemas
from pydantic import EmailStr, BaseModel
from uuid import UUID

class EmailSchema(BaseModel):
    email: List[EmailStr]

class RecordRead(BaseModel):
    id: int
    memo: Optional[str]
    startTime: str
    endTime: str
    fee: int
    time_created: datetime
    time_updated: Optional[datetime]
    class Config:
        orm_mode = True


class RecordUpdate(BaseModel):
    memo: Optional[str]
    startTime: str
    endTime: str
    fee: int


class RecordCreate(BaseModel):
    memo: Optional[str]
    startTime: str
    endTime: str
    fee: int


class ProjectRead(BaseModel):
    id: int
    title: str
    fee: int
    is_active: bool
    owner_id: UUID
    records: List[RecordRead]
    class Config:
        orm_mode = True


class ProjectUpdate(BaseModel):
    title: str
    fee: int
    is_active: bool


class ProjectCreate(BaseModel):
    title: str
    fee: int
    is_active: bool = True

class UserRead(schemas.BaseUser[uuid.UUID]):
    projects: List[ProjectRead]


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass
