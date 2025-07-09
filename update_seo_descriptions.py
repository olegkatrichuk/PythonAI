# update_seo_descriptions.py

import os
import sys
from datetime import datetime, timedelta
import pytz
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.exc import SQLAlchemyError

# -- Setup Path and Environment --
# Add the project root to the Python path to allow importing from 'app'
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

load_dotenv()

# -- Import App Modules --
from app.models import Base, Tool, ToolTranslation
from app.database import get_db

# -- Database Connection --
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL is not set in the .env file.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_all_tools(db_session):
    """
    Fetches all tools to be updated.
    """
    tools = db_session.execute(select(Tool)).scalars().all()
    tools_to_update = []
    target_langs = {'en', 'ru', 'uk'}

    for tool in tools:
        # We need the tool name to search, let's get the English name if possible
        base_translation = next((t for t in tool.translations if t.language_code == 'en'), None)
        if not base_translation:
                base_translation = tool.translations[0] if tool.translations else None

        if base_translation:
            tools_to_update.append({
                "id": tool.id,
                "name": base_translation.name,
                "url": tool.url,
                "missing_langs": list(target_langs) # Assume all languages need update
            })
        else:
            print(f"Skipping tool ID {tool.id} as it has no base name for searching.")

    return tools_to_update

def update_tool_descriptions(db_session, tool_id, descriptions):
    """
    Updates or creates tool translations for a specific tool.
    `descriptions` should be a dictionary like {'en': 'desc...', 'ru': 'desc...'}
    """
    try:
        tool = db_session.get(Tool, tool_id)
        if not tool:
            print(f"Tool with ID {tool_id} not found.")
            return

        for lang, desc_text in descriptions.items():
            # Check if a translation for this language already exists
            translation = next((t for t in tool.translations if t.language_code == lang), None)

            if translation:
                # Update existing description
                translation.description = desc_text
                print(f"Updated description for tool ID {tool_id} in '{lang}'.")
            else:
                # Create new translation
                # Find a base name to use for the new translation
                base_name = tool.translations[0].name if tool.translations else "Unnamed Tool"
                new_translation = ToolTranslation(
                    tool_id=tool_id,
                    language_code=lang,
                    name=base_name,
                    description=desc_text
                )
                db_session.add(new_translation)
                print(f"Created new translation for tool ID {tool_id} in '{lang}'.")

        db_session.commit()
    except SQLAlchemyError as e:
        db_session.rollback()
        print(f"Database error for tool ID {tool_id}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred for tool ID {tool_id}: {e}")


if __name__ == "__main__":
    db_session = scoped_session(SessionLocal)
    try:
        tools_to_process = get_all_tools(db_session)
        if not tools_to_process:
            print("No tools to update at this time.")
        else:
            print(f"Found {len(tools_to_process)} tools to update.")
            
            for tool_data in tools_to_process:
                print(f"\nProcessing tool: {tool_data['name']} (ID: {tool_data['id']})")
                
                # This is where the interactive part will happen.
                # I will replace this with the actual generation logic.
                print("   -> Searching for information...")
                print("   -> Generating new descriptions...")
                print("   -> Translating descriptions...")

                # Placeholder for the generated descriptions
                generated_descriptions = {
                    'en': 'This is a new SEO-optimized description for ' + tool_data['name'],
                    'ru': 'Это новое SEO-оптимизированное описание для ' + tool_data['name'],
                    'uk': 'Це новий SEO-оптимізований опис для ' + tool_data['name']
                }

                print("   -> Updating database...")
                update_tool_descriptions(db_session, tool_data['id'], generated_descriptions)
                print(f"Successfully updated tool: {tool_data['name']}")

            print("\nAll tools have been updated.")

    except Exception as e:
        print(f"An error occurred during the update process: {e}")
    finally:
        db_session.remove()

