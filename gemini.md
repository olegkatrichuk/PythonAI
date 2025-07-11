This project is a full-stack application with a FastAPI backend and a Next.js frontend. Here's a breakdown of the project structure and instructions for setting it up and running it.

### Backend (FastAPI)

The backend is a Python application using the FastAPI framework. It provides a RESTful API for managing users, tools, categories, and reviews.

**Key files:**

*   `app/main.py`: The main entry point of the FastAPI application.
*   `app/models.py`: Defines the SQLAlchemy database models.
*   `app/schemas.py`: Defines the Pydantic schemas for data validation and serialization.
*   `app/crud.py`: Contains the CRUD (Create, Read, Update, Delete) operations for interacting with the database.
*   `app/database.py`: Configures the database connection.
*   `app/security.py`: Handles authentication and authorization.
*   `requirements.txt`: Lists the Python dependencies.
*   `alembic.ini`: Configuration for Alembic database migrations.

### Frontend (Next.js)

The frontend is a modern web application built with Next.js and React. It uses TypeScript and Tailwind CSS for styling.

**Key files:**

*   `frontend/src/app`: The main application directory.
*   `frontend/src/app/[lang]/page.tsx`: The main page of the application.
*   `frontend/src/components`: Reusable React components.
*   `frontend/contexts/AuthContext.tsx`: Manages authentication state.
*   `frontend/package.json`: Lists the Node.js dependencies and scripts.

### Getting Started

To get the project up and running, follow these steps:

1.  **Set up the environment:**
    *   Create a `.env` file in the root directory and add the following variables:
        ```
        SECRET_KEY=your_secret_key
        ALGORITHM=HS256
        ACCESS_TOKEN_EXPIRE_MINUTES=30
        DATABASE_URL=postgresql://user:password@localhost:5432/aifinder_db
        ```
2.  **Run the database:**
    *   Use Docker Compose to start the PostgreSQL database:
        ```
        docker-compose up -d
        ```
3.  **Set up the backend:**
    *   Create a virtual environment and install the Python dependencies:
        ```
        python -m venv .venv
        source .venv/bin/activate
        pip install -r requirements.txt
        ```
    *   Apply the database migrations:
        ```
        alembic upgrade head
        ```
    *   Run the backend server:
        ```
        uvicorn app.main:app --reload
        ```
4.  **Set up the frontend:**
    *   Navigate to the `frontend` directory and install the Node.js dependencies:
        ```
        cd frontend
        npm install
        ```
    *   Run the frontend development server:
        ```
        npm run dev
        ```

### Additional Notes

*   The backend API will be available at `http://localhost:8000`.
*   The frontend application will be available at `http://localhost:3000`.
*   The project uses Alembic for database migrations. To create a new migration, use the `alembic revision` command.
*   The frontend uses `next-i18next` for internationalization. Translations are located in the `public/locales` directory.
*   The project includes several scripts for seeding the database with initial data. These can be found in the root directory (e.g., `seed_users.py`, `seed_tools.py`).

Use python rules from @.windsurfer