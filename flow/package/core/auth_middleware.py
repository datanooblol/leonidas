from jose import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from package.core.config import settings
from jose import jwt, ExpiredSignatureError, JWTError

security = HTTPBearer()

def create_access_token(user_id: str) -> str:
    """Create JWT access token"""
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "exp": expire
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(user_id: str = Depends(verify_token)) -> str:
    """Dependency to get current authenticated user"""
    return user_id