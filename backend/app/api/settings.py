from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.user import UserUpdate, UserSettings, UserInDB
from app.schemas.message import TranslationRequest, TranslationResponse
from app.services.auth import auth_service
from app.services.translation import translation_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/me", response_model=UserSettings)
async def get_my_settings(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's settings.
    
    Returns language and tone preferences.
    """
    return UserSettings(
        preferred_language=current_user.preferred_language,
        preferred_tone=current_user.preferred_tone
    )


@router.put("/me", response_model=UserInDB)
async def update_my_settings(
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update current user's settings.
    
    Can update:
    - full_name
    - avatar_url
    - preferred_language
    - preferred_tone
    """
    user = await auth_service.update_user(db, current_user.id, user_update)
    return user


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(
    translation_request: TranslationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Translate text between languages.
    
    - **text**: Text to translate
    - **source_language**: Source language code
    - **target_language**: Target language code
    - **tone**: Message tone (casual, standard, formal)
    
    Returns translated text with confidence score.
    """
    translation = await translation_service.translate_request(translation_request)
    return translation


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete current user's account.
    
    This action is permanent and will delete:
    - User profile
    - All messages
    - All conversations
    """
    await auth_service.delete_user(db, current_user.id)
    return None
