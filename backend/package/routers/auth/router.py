from fastapi import APIRouter, Depends
from package.core.dependencies import get_auth_service
from package.services.auth_service import AuthService
from .interface import UserRegister, UserLogin, AuthResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: UserRegister,
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.register_user(user_data)

@router.post("/login", response_model=AuthResponse)
async def login(
    user_data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.login_user(user_data)