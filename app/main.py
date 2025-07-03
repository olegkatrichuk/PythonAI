# app/main.py

from fastapi import FastAPI, Depends, HTTPException, Header, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware

# Импортируем все наши модули
from . import crud, models, schemas, security
from .database import get_db, engine

# Создаем таблицы в базе данных (если их нет)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Finder API")
router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Ограничено для безопасности в разработке. Измените для продакшена!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
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


def get_language_from_header(accept_language: Optional[str] = Header("ru")) -> str:
    if accept_language:
        lang = accept_language.split(',')[0].split('-')[0].lower()
        if lang in ['ru', 'en', 'uk']:
            return lang
    return "ru"


@router.post("/users/", response_model=schemas.User, tags=["users"])
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@router.post("/token", response_model=schemas.Token, tags=["users"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = security.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password",
                            headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me/tools/", response_model=List[schemas.Tool], tags=["users"])
def read_own_tools(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
        lang: str = Depends(get_language_from_header)
):
    return crud.get_tools_by_owner(db=db, owner_id=current_user.id, lang=lang)


@router.post("/categories/", response_model=schemas.Category, tags=["categories"])
def create_new_category(category: schemas.CategoryCreate, db: Session = Depends(get_db),
                        current_user: models.User = Depends(get_current_user)):
    return crud.create_category(db=db, category=category)


@router.get("/categories/", response_model=List[schemas.Category], tags=["categories"])
def read_categories(db: Session = Depends(get_db), lang: str = Depends(get_language_from_header)):
    return crud.get_categories_with_translation(db, lang=lang)


@router.post("/tools/", response_model=schemas.Tool, tags=["tools"])
def create_new_tool(tool: schemas.ToolCreate, db: Session = Depends(get_db),
                    current_user: models.User = Depends(get_current_user)):
    return crud.create_tool(db=db, tool=tool, owner_id=current_user.id)


@router.get("/tools/", response_model=schemas.ToolPage, tags=["tools"])
def read_tools(
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
    tools_page = crud.get_tools_with_translation(
        db=db, lang=lang, skip=skip, limit=limit, category_id=category_id, q=q,
        pricing_model=pricing_model, platform=platform, sort_by=sort_by
    )
    return tools_page


@router.get("/tools/featured", response_model=schemas.ToolPage, tags=["tools"])
def read_featured_tools(
        lang: str = Depends(get_language_from_header),
        db: Session = Depends(get_db)
):
    tools_page = crud._get_featured_tools_cached(lang=lang, limit=6)
    return tools_page


@router.get("/tools/latest", response_model=schemas.ToolPage, tags=["tools"])
def read_latest_tools(
        lang: str = Depends(get_language_from_header),
        db: Session = Depends(get_db)
):
    # Возвращаем старую логику с параметром 'latest'
    tools_page = crud._get_latest_tools_cached(lang=lang, limit=6)
    return tools_page


@router.get("/tools/{tool_slug}", response_model=schemas.Tool, tags=["tools"])
def read_tool_by_slug(tool_slug: str, db: Session = Depends(get_db), lang: str = Depends(get_language_from_header)):
    db_tool = crud.get_tool_by_slug_with_translation(db, slug=tool_slug, lang=lang)
    if db_tool is None:
        raise HTTPException(status_code=404, detail="Инструмент или его перевод не найден")
    return db_tool


@router.get("/tools/{tool_slug}/reviews", response_model=List[schemas.Review], tags=["reviews"])
def read_tool_reviews(tool_slug: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_reviews_by_tool_slug(db, slug=tool_slug, skip=skip, limit=limit)


@router.post("/tools/{tool_slug}/reviews", response_model=schemas.Review, tags=["reviews"])
def create_new_review_for_tool(
        tool_slug: str,
        review: schemas.ReviewCreate,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    tool = crud.get_tool_by_slug_with_translation(db, slug=tool_slug)
    if not tool:
        raise HTTPException(status_code=404, detail="Инструмент не найден")

    return crud.create_review(db=db, review=review, tool_id=tool.id, author_id=current_user.id)


@app.get("/", tags=["root"])
def read_root():
    return {"message": "AI Finder API is running"}

app.include_router(router)
