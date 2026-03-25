from app.schemas.common import APIModel
from app.schemas.user import UserPublic


class AuthResponse(APIModel):
    token: str
    user: UserPublic
    firstLogin: bool | None = None
