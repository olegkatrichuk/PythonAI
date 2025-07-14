# app/main.py

from fastapi import FastAPI, Depends, HTTPException, Header, APIRouter, Request, Response, Cookie
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
from contextlib import asynccontextmanager
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware
import traceback

# Импортируем все наши модули
from . import crud, models, schemas, security
from .database import get_db
from .cache import cache
from .config import settings
from .logger import log_error, log_info, log_warning
from .rate_limit import (
    limiter, rate_limit_handler, RateLimitHeadersMiddleware,
    apply_read_limit, apply_search_limit, apply_write_limit,
    apply_auth_limit, apply_analytics_limit, get_rate_limit_stats
)
from slowapi.errors import RateLimitExceeded

# Lifecycle events для подключения/отключения Redis
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await cache.connect()
    yield
    # Shutdown
    await cache.disconnect()

app = FastAPI(title="AI Finder API", lifespan=lifespan)
router = APIRouter(prefix="/api")

# Добавляем middleware
# Настраиваем CORS в зависимости от окружения
if settings.ENVIRONMENT == "development":
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
else:
    cors_origins = [
        "https://www.getaifind.com",
        "https://getaifind.com",
        settings.FRONTEND_URL,
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Добавляем rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.add_middleware(RateLimitHeadersMiddleware)

# Глобальный error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Глобальный обработчик ошибок."""
    log_error(f"Unhandled exception on {request.url}", error=exc)
    
    # Не показываем внутренние ошибки пользователю
    return HTTPException(
        status_code=500,
        detail="Internal server error"
    )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Сначала пытаемся получить токен из cookie
    auth_token = request.cookies.get("access_token")
    
    # Если нет в cookie, пытаемся получить из header (для совместимости)
    if not auth_token and token:
        auth_token = token
    
    if not auth_token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(auth_token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: Optional[str] = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_admin_user(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Middleware для проверки админских прав."""
    if not crud.is_user_admin(db, current_user.id):
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin rights required."
        )
    return current_user


def get_language_from_header(accept_language: Optional[str] = Header("ru")) -> str:
    if accept_language:
        lang = accept_language.split(',')[0].split('-')[0].lower()
        if lang in ['ru', 'en', 'uk']:
            return lang
    return "ru"


@router.post("/users/", response_model=schemas.User, tags=["users"])
@apply_write_limit()
def create_new_user(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = crud.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        created_user = crud.create_user(db=db, user=user)
        return created_user

    except HTTPException:
        # Перебрасываем HTTPException как есть (например, дублированный email)
        raise
    except Exception as e:
        # Логируем ошибку для разработчиков
        log_error(f"Error creating user {user.email}", error=e)

        # Проверяем на IntegrityError от базы данных  
        if "unique constraint" in str(e).lower() or "duplicate" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Возвращаем стандартную ошибку 500
        raise HTTPException(status_code=500, detail="Internal server error during user creation.")


@router.post("/token", response_model=schemas.Token, tags=["users"])
@apply_auth_limit()
def login_for_access_token(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = security.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        log_warning(f"Failed login attempt for email: {form_data.username}")
        raise HTTPException(status_code=401, detail="Incorrect username or password",
                            headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    
    # Устанавливаем httpOnly cookie для безопасности
    # В development режиме не используем secure=True для HTTP
    is_production = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,  # Только для HTTPS в production
        samesite="lax" if not is_production else "strict",  # Более гибкие настройки для development
        max_age=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    log_info(f"User {user.email} logged in successfully", user_id=user.id)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", tags=["users"])
@apply_auth_limit()
def logout(request: Request, response: Response):
    """Logout пользователя путем удаления httpOnly cookie."""
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}


@router.get("/users/me/tools/", response_model=List[schemas.Tool], tags=["users"])
@apply_read_limit()
def read_own_tools(
        request: Request,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
        lang: str = Depends(get_language_from_header)
):
    return crud.get_tools_by_owner(db=db, owner_id=current_user.id, lang=lang)


@router.post("/categories/", response_model=schemas.Category, tags=["categories"])
@apply_write_limit()
def create_new_category(request: Request, category: schemas.CategoryCreate, db: Session = Depends(get_db),
                        current_user: models.User = Depends(get_current_user)):
    return crud.create_category(db=db, category=category)


@router.get("/categories/", response_model=List[schemas.Category], tags=["categories"])
@apply_read_limit()
async def read_categories(request: Request, db: Session = Depends(get_db), lang: str = Depends(get_language_from_header)):
    return await crud.get_categories_with_cache(db, lang=lang)


@router.get("/categories/{category_slug}", response_model=schemas.Category, tags=["categories"])
@apply_read_limit()
def read_category_by_slug(request: Request, category_slug: str, db: Session = Depends(get_db), lang: str = Depends(get_language_from_header)):
    db_category = crud.get_category_by_slug(db, slug=category_slug, lang=lang)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return db_category


@router.post("/tools/", response_model=schemas.Tool, tags=["tools"])
@apply_write_limit()
async def create_new_tool(request: Request, tool: schemas.ToolCreate, db: Session = Depends(get_db),
                    current_user: models.User = Depends(get_current_user)):
    return await crud.create_tool_with_cache_invalidation(db=db, tool=tool, owner_id=current_user.id)


@router.get("/tools/", response_model=schemas.ToolPage, tags=["tools"])
@apply_search_limit()
async def read_tools(
        request: Request,
        db: Session = Depends(get_db),
        lang: str = Depends(get_language_from_header),
        category_id: Optional[int] = None,
        q: Optional[str] = None,
        page: int = 1,
        limit: int = 12,
        pricing_model: Optional[models.PricingModel] = None,
        platform: Optional[str] = None,
        sort_by: Optional[str] = None
):
    skip = (page - 1) * limit
    tools_page = await crud.get_tools_with_cache(
        db=db, lang=lang, skip=skip, limit=limit, category_id=category_id, q=q,
        pricing_model=pricing_model, platform=platform, sort_by=sort_by
    )
    return tools_page


@router.get("/tools/featured", response_model=schemas.ToolPage, tags=["tools"])
@apply_read_limit()
def read_featured_tools(
        request: Request,
        lang: str = Depends(get_language_from_header),
        db: Session = Depends(get_db)
):
    tools_page = crud._get_featured_tools_cached(lang=lang, limit=6)
    return tools_page


@router.get("/tools/latest", response_model=schemas.ToolPage, tags=["tools"])
@apply_read_limit()
def read_latest_tools(
        request: Request,
        lang: str = Depends(get_language_from_header),
        db: Session = Depends(get_db)
):
    # Возвращаем старую логику с параметром 'latest'
    tools_page = crud._get_latest_tools_cached(lang=lang, limit=6)
    return tools_page


@router.get("/tools/{tool_slug}", response_model=schemas.Tool, tags=["tools"])
@apply_read_limit()
def read_tool_by_slug(request: Request, tool_slug: str, db: Session = Depends(get_db), lang: str = Depends(get_language_from_header)):
    db_tool = crud.get_tool_by_slug_with_translation(db, slug=tool_slug, lang=lang)
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Инструмент или его перевод не найден")
    return db_tool


@router.get("/tools/{tool_slug}/reviews", response_model=List[schemas.Review], tags=["reviews"])
@apply_read_limit()
def read_tool_reviews(request: Request, tool_slug: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_reviews_by_tool_slug(db, slug=tool_slug, skip=skip, limit=limit)


@router.post("/tools/{tool_slug}/reviews", response_model=schemas.Review, tags=["reviews"])
@apply_write_limit()
def create_new_review_for_tool(
        request: Request,
        tool_slug: str,
        review: schemas.ReviewCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    tool = crud.get_tool_by_slug_with_translation(db, slug=tool_slug)
    if not tool:
        raise HTTPException(status_code=404, detail="Инструмент не найден")

    # Исправляем: tool - это словарь, получаем id как ключ
    tool_id = tool["id"] if isinstance(tool, dict) else tool.id
    return crud.create_review(db=db, review=review, tool_id=tool_id, author_id=current_user.id)


@app.get("/", tags=["root"])
@apply_read_limit()
def read_root(request: Request):
    return {"message": "AI Finder API is running"}

# Добавляем endpoint для статистики rate limiting
@app.get("/api/stats/rate-limits", tags=["stats"])
@apply_read_limit()
async def read_rate_limit_stats(request: Request):
    return await get_rate_limit_stats()

# --- АДМИНСКИЕ ENDPOINTS ДЛЯ АНАЛИТИКИ ---

@router.get("/admin/stats", response_model=schemas.AdminStats, tags=["admin"])
@apply_read_limit()
def get_admin_statistics(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """Получить статистику для админ панели."""
    return crud.get_admin_stats(db)


@router.post("/admin/daily-stats/update", tags=["admin"])
@apply_write_limit()
def update_daily_statistics(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin_user)
):
    """Обновить ежедневную статистику."""
    crud.update_daily_stats(db)
    return {"message": "Daily statistics updated successfully"}


# --- ENDPOINTS ДЛЯ ТРЕКИНГА АНАЛИТИКИ ---

@router.post("/analytics/page-view", response_model=schemas.PageView, tags=["analytics"])
@apply_analytics_limit()
def track_page_view(
    request: Request,
    page_view: schemas.PageViewCreate,
    db: Session = Depends(get_db)
):
    """Отслеживать просмотр страницы."""
    user_id = None
    
    # Пытаемся получить токен из cookie или header
    auth_token = request.cookies.get("access_token")
    if not auth_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            auth_token = auth_header.split(" ")[1]
    
    if auth_token:
        try:
            payload = jwt.decode(auth_token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
            email = payload.get("sub")
            if email:
                user = crud.get_user_by_email(db, email=email)
                if user:
                    user_id = user.id
        except JWTError:
            pass  # Не авторизован, но это нормально для аналитики
    
    return crud.create_page_view(db=db, page_view=page_view, user_id=user_id)


@router.post("/analytics/search", response_model=schemas.SearchQuery, tags=["analytics"])
@apply_write_limit()
def track_search_query(
    request: Request,
    search_query: schemas.SearchQueryCreate,
    db: Session = Depends(get_db)
):
    """Отслеживать поисковый запрос."""
    user_id = None
    
    # Пытаемся получить токен из cookie или header
    auth_token = request.cookies.get("access_token")
    if not auth_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            auth_token = auth_header.split(" ")[1]
    
    if auth_token:
        try:
            payload = jwt.decode(auth_token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
            email = payload.get("sub")
            if email:
                user = crud.get_user_by_email(db, email=email)
                if user:
                    user_id = user.id
        except JWTError:
            pass  # Не авторизован, но это нормально для аналитики
    
    return crud.create_search_query(db=db, search_query=search_query, user_id=user_id)


# --- ENDPOINTS ДЛЯ ПОЛУЧЕНИЯ ПОЛЬЗОВАТЕЛЯ С АДМИНСКИМИ ПРАВАМИ ---

@router.get("/users/me/", response_model=schemas.UserWithAdmin, tags=["users"])
@apply_read_limit()
def read_users_me(
    request: Request,
    current_user: models.User = Depends(get_current_user)
):
    """Получить информацию о текущем пользователе с админскими правами."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_active": current_user.is_active if current_user.is_active is not None else True,
        "is_admin": current_user.is_admin if current_user.is_admin is not None else False
    }


# --- ENDPOINTS ДЛЯ АВТОДОПОЛНЕНИЯ ---

@router.get("/tools/search-suggestions", response_model=schemas.ToolPage, tags=["tools"])
@apply_search_limit()
def get_tool_search_suggestions(
    request: Request,
    q: str,
    limit: int = 5,
    lang: str = Depends(get_language_from_header),
    db: Session = Depends(get_db)
):
    """Получить предложения для автодополнения поиска инструментов."""
    if not q.strip() or len(q.strip()) < 2:
        return {"items": [], "total": 0}
    
    tools = crud.search_tools_for_autocomplete(db=db, query=q, limit=limit, lang=lang)
    return {"items": tools, "total": len(tools)}


@router.get("/categories/search", response_model=List[schemas.Category], tags=["categories"])
@apply_search_limit()
def search_categories_for_autocomplete(
    request: Request,
    q: str,
    limit: int = 3,
    lang: str = Depends(get_language_from_header),
    db: Session = Depends(get_db)
):
    """Поиск категорий для автодополнения."""
    if not q.strip() or len(q.strip()) < 2:
        return []
    
    return crud.search_categories_for_autocomplete(db=db, query=q, limit=limit, lang=lang)


app.include_router(router)
