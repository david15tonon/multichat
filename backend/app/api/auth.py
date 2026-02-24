from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.user import (
    UserCreate,
    UserInDB,
    UserPublic,
    Token,
    LoginRequest,
    RefreshTokenRequest
)
from app.services.auth import auth_service
from app.core.security import security
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_create: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **password**: Minimum 8 characters with uppercase, lowercase, and digit
    - **full_name**: User's full name
    - **preferred_language**: Default language (optional)
    - **preferred_tone**: Default message tone (optional)
    """
    # Create user
    user = await auth_service.create_user(db, user_create)
    
    # Generate tokens
    tokens = security.create_token_pair(str(user.id), user.email)
    
    return tokens


@router.post("/login", response_model=Token)
async def login(
    login_request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password.
    
    Returns access and refresh tokens.
    """
    # Authenticate user
    user = await auth_service.authenticate_user(
        db,
        login_request.email,
        login_request.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate tokens
    tokens = security.create_token_pair(str(user.id), user.email)
    
    # Update user status
    await auth_service.update_user_status(db, user.id, is_online=True)
    
    return tokens


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    Returns new access and refresh tokens.
    """
    # Decode refresh token
    payload = security.decode_token(refresh_request.refresh_token)
    
    # Verify token type
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    # Get user
    from uuid import UUID
    user_id = UUID(payload.get("sub"))
    user = await auth_service.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new tokens
    tokens = security.create_token_pair(str(user.id), user.email)
    
    return tokens


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout current user.
    
    Updates user status to offline.
    """
    await auth_service.update_user_status(db, current_user.id, is_online=False)
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserInDB)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information.
    
    Requires authentication.
    """
    return current_user


@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user_public(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get public user information by ID.
    
    Requires authentication.
    """
    from uuid import UUID
    
    user = await auth_service.get_user_by_id(db, UUID(user_id))
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
