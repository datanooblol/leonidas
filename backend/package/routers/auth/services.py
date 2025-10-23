import bcrypt
from fastapi import HTTPException
from .database import create_user, get_user_by_email
from .interface import UserRegister, UserLogin, AuthResponse
from package.core.auth_middleware import create_access_token

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def register_user(user_data: UserRegister) -> AuthResponse:
    """Register new user"""
    # Check if user already exists
    existing_user = get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    password_hash = hash_password(user_data.password)
    user = create_user(user_data.email, password_hash)
    
    # Generate access token
    access_token = create_access_token(user.user_id)  # Use .user_id instead of ['user_id']
    
    return AuthResponse(
        user_id=user.user_id,  # Use .user_id
        email=user.email,      # Use .email
        access_token=access_token
    )

def login_user(user_data: UserLogin) -> AuthResponse:
    """Login user"""
    # Get user by email
    user = get_user_by_email(user_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(user_data.password, user.password_hash):  # Use .password_hash
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate access token
    access_token = create_access_token(user.user_id)  # Use .user_id
    
    return AuthResponse(
        user_id=user.user_id,  # Use .user_id
        email=user.email,      # Use .email
        access_token=access_token
    )


# def register_user(user_data: UserRegister) -> AuthResponse:
#     """Register new user"""
#     # Check if user already exists
#     existing_user = get_user_by_email(user_data.email)
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")
    
#     # Hash password and create user
#     password_hash = hash_password(user_data.password)
#     user = create_user(user_data.email, password_hash)
    
#     # Generate access token
#     access_token = create_access_token(user['user_id'])
    
#     return AuthResponse(
#         user_id=user['user_id'],
#         email=user['email'],
#         access_token=access_token
#     )

# def login_user(user_data: UserLogin) -> AuthResponse:
#     """Login user"""
#     # Get user by email
#     user = get_user_by_email(user_data.email)
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid credentials")
    
#     # Verify password
#     if not verify_password(user_data.password, user['password_hash']):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
    
#     # Generate access token
#     access_token = create_access_token(user['user_id'])
    
#     return AuthResponse(
#         user_id=user['user_id'],
#         email=user['email'],
#         access_token=access_token
#     )