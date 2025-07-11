# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack AI Tools directory application built with FastAPI (backend) and Next.js (frontend). The application allows users to browse, search, and review AI tools across different categories with multi-language support (ru, en, uk).

## Architecture

### Backend (FastAPI)
- **Main API**: `app/main.py` - FastAPI application with OAuth2 authentication
- **Models**: `app/models.py` - SQLAlchemy models for User, Tool, Category, Review, and translation tables
- **Database**: PostgreSQL with Alembic migrations
- **Multi-language**: Uses translation tables (ToolTranslation, CategoryTranslation) for i18n
- **Authentication**: JWT-based auth with password hashing
- **Review system**: Users can rate tools (1-5 stars) and leave text reviews

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS with custom themes
- **i18n**: Multi-language routing with `[lang]` dynamic segments
- **Authentication**: JWT token management with axios interceptors
- **SEO**: Comprehensive metadata generation and structured data

### Database Schema
- **Users**: Authentication and tool ownership
- **Tools**: Core tool information with slugs, ratings, pricing models
- **Categories**: Tool categorization with translations
- **Reviews**: User reviews with ratings (replaces old Comment model)
- **Translation tables**: Separate tables for multilingual content

## Common Development Commands

### Backend Development
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Generate new migration
alembic revision --autogenerate -m "description"

# Start FastAPI development server
uvicorn app.main:app --reload
```

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Key Patterns and Conventions

### API Endpoints
- All API routes are prefixed with `/api`
- Language preference passed via `Accept-Language` header
- JWT authentication required for user-specific actions
- Pagination using `skip` and `limit` parameters

### Database Operations
- Use `crud.py` functions for all database operations
- Always use `_populate_tool_translation_details()` for tool queries
- Update tool ratings automatically when reviews are created/updated
- Slug generation uses `python-slugify` with collision handling

### Frontend Routing
- Multi-language routing: `/[lang]/path`
- Dynamic routes for tools: `/[lang]/tool/[slug]`
- Category filtering: `/[lang]/category/[slug]`
- SEO-friendly URLs with proper canonical tags

### Translation System
- Backend: Language-specific queries join translation tables
- Frontend: `getTranslations()` function in `lib/translations.ts`
- Fallback language: Russian (`ru`) when preferred language unavailable

## Environment Setup

### Required Environment Variables
```
# Backend (.env)
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
gemini_api_key=optional-gemini-api-key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Configuration
- PostgreSQL database required
- Connection string in `alembic.ini` and environment variables
- Alembic configured in `alembic/env.py` to use app models

## Code Quality Notes

### Backend
- Use Pydantic schemas for request/response validation
- SQL injection prevention through SQLAlchemy ORM
- Content sanitization with `bleach` library for user input
- Proper error handling with HTTP status codes

### Frontend
- TypeScript strict mode enabled
- Responsive design with Tailwind CSS
- Image optimization with Next.js Image component
- Client-side state management with React Context

## Testing and Deployment

### Database Migrations
- Always test migrations in development first
- Use `alembic upgrade head` for applying migrations
- Review generated migration files before applying

### Security Considerations
- JWT tokens stored securely in client
- Password hashing with bcrypt
- CORS configured for development (update for production)
- Input sanitization for user-generated content

## Debugging Common Issues

### Backend Issues
- Check database connection string in both `.env` and `alembic.ini`
- Verify all required environment variables are set
- Debug prints in `crud.py` for rating calculations

### Frontend Issues
- Ensure API_URL environment variable is correctly set
- Check browser console for authentication errors
- Verify language routing is working correctly

## File Structure Notes

- `app/` - Backend FastAPI application
- `frontend/src/` - Next.js application source
- `alembic/` - Database migration files
- `frontend/src/app/[lang]/` - Multi-language pages
- `frontend/src/components/` - Reusable React components
- `frontend/src/types/` - TypeScript type definitions