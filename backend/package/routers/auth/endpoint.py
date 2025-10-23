from fastapi import APIRouter, Depends
from .interface import UserRegister, UserLogin, AuthResponse
from .services import register_user, login_user
from package.core.auth_middleware import get_current_user

router = APIRouter()

@router.post("/register", response_model=AuthResponse)
def register(user_data: UserRegister):
    """Register new user"""
    return register_user(user_data)

@router.post("/login", response_model=AuthResponse)
def login(user_data: UserLogin):
    """Login user"""
    return login_user(user_data)