from typing import Optional
from sqlmodel import Field, SQLModel
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    DEVELOPER = "developer"
    VIEWER = "viewer"

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    role: UserRole = Field(default=UserRole.VIEWER)
    full_name: Optional[str] = None

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
