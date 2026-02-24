from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import LanguageEnum, MessageToneEnum


# User Schemas
class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    preferred_language: LanguageEnum = LanguageEnum.EN
    preferred_tone: MessageToneEnum = MessageToneEnum.STANDARD


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None
    preferred_language: Optional[LanguageEnum] = None
    preferred_tone: Optional[MessageToneEnum] = None


class UserInDB(UserBase):
    """Schema for user in database"""
    id: UUID
    avatar_url: Optional[str] = None
    is_active: bool
    is_online: bool
    is_verified: bool
    oauth_provider: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserPublic(BaseModel):
    """Public user information"""
    id: UUID
    full_name: str
    avatar_url: Optional[str] = None
    is_online: bool
    preferred_language: LanguageEnum
    last_seen: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserSettings(BaseModel):
    """User settings"""
    preferred_language: LanguageEnum
    preferred_tone: MessageToneEnum
    
    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    """Token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Token payload"""
    sub: str  # user_id
    email: str
    exp: datetime
    type: str  # "access" or "refresh"


class LoginRequest(BaseModel):
    """Login request"""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class PasswordReset(BaseModel):
    """Password reset request"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)
