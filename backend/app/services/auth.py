from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select
from fastapi import HTTPException, status
from uuid import UUID

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import security


class AuthService:
    """Authentication service"""
    
    @staticmethod
    async def create_user(db: AsyncSession, user_create: UserCreate) -> User:
        """Create a new user"""
        # Check if user already exists
        result = await db.execute(
            select(User).where(User.email == user_create.email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = User(
            email=user_create.email,
            full_name=user_create.full_name,
            hashed_password=security.get_password_hash(user_create.password),
            preferred_language=user_create.preferred_language,
            preferred_tone=user_create.preferred_tone,
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        email: str,
        password: str
    ) -> Optional[User]:
        """Authenticate user with email and password"""
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        if not security.verify_password(password, user.hashed_password):
            return None
        
        return user
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def search_users(
        db: AsyncSession,
        query: str,
        exclude_user_id: UUID,
        limit: int = 20,
    ) -> List[User]:
        """Cherche des utilisateurs par nom ou e-mail (insensible à la casse).

        Sans cette recherche, démarrer une conversation exigerait de connaître
        l'UUID de son interlocuteur : l'application était inutilisable.
        L'utilisateur courant est exclu — on ne se parle pas à soi-même.
        """
        needle = f"%{query.strip()}%"
        stmt = (
            select(User)
            .where(
                User.id != exclude_user_id,
                User.is_active.is_(True),
                or_(User.full_name.ilike(needle), User.email.ilike(needle)),
            )
            .order_by(User.full_name)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: UUID,
        user_update: UserUpdate
    ) -> User:
        """Update user information"""
        user = await AuthService.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def update_user_status(
        db: AsyncSession,
        user_id: UUID,
        is_online: bool
    ) -> None:
        """Update user online status"""
        user = await AuthService.get_user_by_id(db, user_id)
        
        if user:
            user.is_online = is_online
            if not is_online:
                from datetime import datetime
                user.last_seen = datetime.utcnow()
            
            await db.commit()
    
    @staticmethod
    async def delete_user(db: AsyncSession, user_id: UUID) -> None:
        """Delete user account"""
        user = await AuthService.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        await db.delete(user)
        await db.commit()


auth_service = AuthService()
