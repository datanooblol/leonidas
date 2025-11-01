import bcrypt
from fastapi import HTTPException
from package.core.repositories import UserRepository
from package.core.auth_middleware import create_access_token
from package.schemas.user import User
from package.routers.auth.interface import UserRegister, UserLogin, AuthResponse

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    async def register_user(self, user_data: UserRegister) -> AuthResponse:
        """Register new user"""
        # Check if user already exists
        existing_user = await self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and create user
        password_hash = self.hash_password(user_data.password)
        user = User(email=user_data.email, password_hash=password_hash)
        created_user = await self.user_repo.create(user)
        
        # Generate access token
        access_token = create_access_token(created_user.user_id)
        
        return AuthResponse(
            user_id=created_user.user_id,
            email=created_user.email,
            access_token=access_token
        )
    
    async def login_user(self, user_data: UserLogin) -> AuthResponse:
        """Login user"""
        # Get user by email
        user = await self.user_repo.get_by_email(user_data.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        if not self.verify_password(user_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate access token
        access_token = create_access_token(user.user_id)
        
        return AuthResponse(
            user_id=user.user_id,
            email=user.email,
            access_token=access_token
        )