from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api import deps
from app.core import security
from app.core.db import get_session
from app.models.user import User, UserCreate, UserRead

router = APIRouter()

@router.get("/me", response_model=UserRead)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.post("/", response_model=UserRead)
def create_user(
    user_in: UserCreate,
    session: Session = Depends(get_session),
) -> Any:
    """
    Create new user.
    """
    statement = select(User).where(User.email == user_in.email)
    user = session.exec(statement).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    
    user = User.from_orm(user_in)
    user.hashed_password = security.get_password_hash(user_in.password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
