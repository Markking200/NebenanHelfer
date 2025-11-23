# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NebenanHelfer is a help request platform connecting seniors with students. The system uses:
- **FastAPI backend** for REST API endpoints
- **Telegram bot integration** for voice-based help requests from seniors
- **Google Gemini AI** for transcribing and extracting structured data from German voice messages
- **Google Address Validation API** for verifying addresses
- **SQLite database** with async support via `databases` and SQLAlchemy

The workflow: Seniors call via Telegram voice messages (in German) → AI transcribes and extracts help request details → System validates data → Students can browse and accept requests via API.

## Development Setup

### Installation
```bash
# Install all dependencies
pip install -r requirements.txt

# Install development tools (linting, testing)
pip install -r requirements-dev.txt
```

### Environment Configuration
Create a `.env` file in the project root with:
- `ENV_STATE` - Set to "dev", "test", or "prod"
- `DEV_DATABASE_URL` - Database connection string (defaults to SQLite: `sqlite:///data.db`)
- `TELEGRAM` - Telegram bot token
- `GEMINI_API_KEY` - Google Gemini API key
- `GOVAL` - Google Address Validation API key

### Running the Application

**Main Backend Server:**
```bash
# Run FastAPI backend (default port 8000)
uvicorn backend.main:app --reload

# Run on specific port
uvicorn backend.main:app --reload --port 8080
```

**Telegram Webhook Server (Voice Processing):**
```bash
# Run the voice processing endpoint
uvicorn main:app --reload --port 8001
```

**Simple Phone Answer Test:**
```bash
# Run basic Twilio test server
python answer_phone.py
```

### Testing
```bash
# Run all tests
pytest

# Run with async support
pytest --asyncio-mode=auto

# Run specific test file
pytest tests/test_requests.py
```

### Code Quality
```bash
# Format code
black .

# Sort imports
isort .

# Lint code
ruff check .
```

## Architecture

### Two-Server Setup
1. **Backend API** (`backend/main.py`) - Handles user registration, login, CRUD operations for help requests
2. **Telegram Voice Bot** (`main.py`) - Processes voice messages from seniors, uses AI to extract structured data, **and creates requests in the shared database**

Both servers share the same database (`data.db`) and models. The Telegram bot imports from `backend.database` and `backend.models` to create users and requests.

### Database Schema

**Users Table:**
- Fields: id, full_name, phone, email, password, user_type (senior/student), address
- Two user types: `UserType.SENIOR` and `UserType.STUDENT`

**Requests Table:**
- Fields: id, title, address, details, user_id (senior), student_id (nullable), created_at, status, current_contact_number
- Status values: "open", "in_progress", "completed"

### Key Components

**Configuration (`backend/config.py`):**
- Environment-based config using Pydantic Settings
- Three environments: dev, test, prod
- Config loaded via `get_config()` function

**Database (`backend/database.py`):**
- Async database connection using `databases` library
- SQLAlchemy for schema definition
- Auto-creates tables on startup
- Connection managed via FastAPI lifespan events

**Models:**
- `backend/models/user.py` - User schemas (UserBase, UserCreate, UserResponse)
- `backend/models/requests.py` - Request schemas (HelpRequestBase, HelpRequestCreate, HelpRequestUpdate, HelpRequestResponse, HelpRequestResponseWithUser)

**Routers:**
- `backend/routers/user.py` - User registration (`/api/register`), login (`/api/login`), get user (`/api/user/{user_id}`)
- `backend/routers/requests.py` - Create request (`/api/request`), list requests (`/api/requests`), update request (`/api/request/{request_id}`)

**Voice Processing (`main.py`):**
- `/telegram-webhook` endpoint receives Telegram voice messages
- `gemini_transcribe_and_extract()` - Sends audio to Gemini for German transcription and extracts JSON with fields: titel, name, help_type, address, contact_preferences, requested_time, duration, benötigte_fähigkeiten, risiko_faktoren, urgency, notes, habe_alle_informationen, notfall, zusammenfassung
- `address_exists()` - Validates German addresses using Google Address Validation API
- `tts_to_mp3()` and `mp3_to_ogg_opus()` - Convert text responses to voice (requires ffmpeg)
- `/start` command triggers greeting message in German
- `get_or_create_senior_user()` - Finds existing senior by phone or creates new user with auto-generated email/password
- `create_help_request_from_data()` - Converts Gemini extracted data into database request
- `pending_requests` dict - Stores chat_id → data mapping during confirmation flow

### Business Logic

**Request Creation via API:**
- Only senior users can create help requests via `/api/request`
- System validates that all required information is present before confirming
- Address must be validated via Google Address Validation API
- Emergency requests (`notfall: true`) trigger immediate 112 alert response

**Request Creation via Telegram:**
1. Senior sends voice message to Telegram bot
2. Gemini extracts structured data from German audio
3. System validates completeness and address accuracy
4. If incomplete, bot asks for missing information
5. If complete, bot reads back summary and asks for confirmation
6. On "ja" confirmation:
   - Creates or finds senior user by phone number
   - Creates help request in database
   - Returns security code to senior
7. On "nein", discards request and asks to call again
8. `pending_requests` dict tracks chat_id during confirmation (not persistent across restarts)

**Request Assignment:**
- Only student users can accept/update requests
- Updating a request assigns the student's ID to `student_id` field
- Status can be changed via `HelpRequestUpdate` model

**Data Seeding:**
- `backend/utils/predefined_users.py` contains test users (3 seniors, 3 students) and sample requests
- Seeded automatically on app startup via lifespan event
- Check existing records before inserting to avoid duplicates

## Important Notes

- All voice messages are processed in **German**
- The Gemini prompt is very specific about extracting help request information - modify carefully
- Address validation requires exact format: "Straße Hausnummer, PLZ Ort"
- CORS is currently set to allow all origins (`*`) - restrict in production
- Passwords are stored in plaintext - implement proper hashing before production
- The `pending_requests` dict in `main.py` stores state in memory - not persistent across server restarts, not thread-safe for production with multiple workers
- FFmpeg is required for voice message conversion (`mp3_to_ogg_opus`)
- Telegram users are auto-created with email format `telegram_{chat_id}@nebenanhelfer.de`
- The same database file (`data.db`) is accessed by both FastAPI servers - ensure only one writes at a time or use proper connection pooling
