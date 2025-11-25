# ZeitZuHelfen 🤝

**Connecting Seniors with Student Volunteers through Voice-First AI**

ZeitZuHelfen is a help request platform that bridges the gap between seniors needing assistance and students willing to help. Built for HackaTUM 2025, the system uses AI-powered voice recognition to make requesting help as simple as making a phone call.

---

## 🎯 Problem Statement

Many seniors struggle with technology barriers when seeking help with everyday tasks. Traditional apps require smartphone proficiency, form-filling, and digital literacy that can be challenging for older adults.

**Our Solution:** A voice-first interface through Telegram that allows seniors to request help by simply speaking—no typing, no forms, just conversation. 
For students a way to engage with Munich community while earning some rewards.

---

## ✨ Key Features

### For Seniors
- 📞 **Voice-Based Requests**: Call through Telegram and speak your request in German
- 🤖 **AI Understanding**: Google Gemini AI transcribes and extracts structured information
- 🔊 **Voice Confirmations**: System reads back your request for confirmation
- 🆘 **Emergency Detection**: Automatic 112 alert routing for emergencies

### For Students
- 📋 **Browse Requests**: View all open help requests via website
- 📍 **Location Details**: Full address and contact information after verification
- ⏰ **Time Preferences**: See when help is needed and estimated duration
- ✅ **Accept & Track**: Update request status when helping

---

## 🏗️ Architecture

### Two-Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ZeitZuHelfen System                     │
├──────────────────────────────┬──────────────────────────────┤
│   Backend API                │  Telegram Bot                │
│   - User Management          │  - Voice Message Processing  │
│   - Request CRUD             │  - AI Transcription          │
│   - Student Interface        │  - Address Validation        │
│   - Authentication           │  - Database Integration      │
└──────────────────────────────┴──────────────────────────────┘
                    │                        │
                    └────────┬───────────────┘
                             ▼
                    ┌────────────────┐
                    │ SQLite Database│
                    │   (Shared)     │
                    └────────────────┘
```

### Technology Stack

**Backend Framework:**
- FastAPI - Modern async Python web framework
- Pydantic - Data validation using Python type hints
- SQLAlchemy - SQL toolkit and ORM
- databases - Async database support

**AI & Voice Processing:**
- Google Gemini 2.0 Flash - Voice transcription & data extraction
- Google Text-to-Speech (gTTS) - German voice responses
- ffmpeg - Audio format conversion (OGG Opus)

**External APIs:**
- Telegram Bot API - Voice message interface
- Google Address Validation API - German address verification

**Database:**
- SQLite - Lightweight file-based database
- Async queries via `databases` library

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- ffmpeg (for audio conversion)
- Telegram Bot Token
- Google Gemini API Key
- Google Address Validation API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/NebenanHelfer.git
cd NebenanHelfer
```

2. **Install dependencies**
```bash
pip install -r requirements.txt

# Optional: Development tools
pip install -r requirements-dev.txt
```

3. **Configure environment variables**

Create a `.env` file in the project root:

```env
# Environment mode: dev, test, or prod
ENV_STATE=dev

# Database
DEV_DATABASE_URL=sqlite:///data.db

# Telegram Bot
TELEGRAM=your_telegram_bot_token_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Google Address Validation
GOVAL=your_google_address_validation_api_key_here
```

4. **Install ffmpeg** (required for voice processing)

**Windows:**
```bash
# Using chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### Running the Application

**Start the Backend API** (Port 8000)
```bash
uvicorn backend.main:app --reload
```

**Start the Telegram Voice Bot** (Port 5000)
```bash
uvicorn main:app --reload --port 5000
```

The backend API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

---

## 📱 How It Works

### Senior User Flow

1. **Start Conversation**
   - Senior sends `/start` to Telegram bot
   - Bot responds with voice instructions in German

2. **Voice Request**
   - Senior records voice message with help details:
     - Name
     - Type of help needed (shopping, household, transport, etc.)
     - Full address with postal code
     - When help is needed
     - Estimated duration

3. **AI Processing**
   - Gemini transcribes German audio
   - Extracts structured JSON data
   - Validates address using Google Maps API

4. **Validation & Confirmation**
   - If incomplete → Bot asks for missing information
   - If complete → Bot reads back summary
   - Senior confirms with voice "ja" or "nein"

5. **Request Creation**
   - On "ja": Creates user and help request in database
   - Returns unique security code
   - Request appears in student interface

### Student User Flow

1. **Browse Requests** - `GET /api/requests?status=open`
2. **View Details** - Full information including address, time, contact
3. **Accept Request** - `PUT /api/request/{id}` with student ID
4. **Complete** - Update status to "completed"

---

## 🔧 API Endpoints

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user (senior/student) |
| POST | `/api/login` | Authenticate user |
| GET | `/api/user/{user_id}` | Get user details |

### Help Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/request` | Create help request (seniors only) |
| GET | `/api/requests?status={status}` | List requests (filtered by status) |
| PUT | `/api/request/{request_id}` | Update request (students accept) |

### Telegram Webhook

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/telegram-webhook` | Receive Telegram voice messages |

---

## 💾 Database Schema

### Users Table
```sql
- id: INTEGER PRIMARY KEY
- full_name: VARCHAR
- phone: VARCHAR
- email: VARCHAR UNIQUE
- password: VARCHAR
- user_type: VARCHAR ('senior' | 'student')
- address: VARCHAR
```

### Requests Table
```sql
- id: INTEGER PRIMARY KEY
- title: VARCHAR
- details: TEXT
- address: VARCHAR
- current_contact_number: VARCHAR
- target_date: VARCHAR (nullable)
- user_id: INTEGER (FK → users.id)
- student_id: INTEGER (FK → users.id, nullable)
- created_at: DATETIME
- status: VARCHAR ('open' | 'in_progress' | 'completed')
```

---

## 🤖 AI Prompt Engineering

The Gemini AI prompt is carefully crafted to extract structured German voice data:

**Extracted Fields:**
- `titel` - Short request title
- `name` - Senior's name
- `help_type` - Category (Einkaufen, Haushalt, Transport, Technik, etc.)
- `address` - Full address with postal code
- `requested_time` - When help is needed
- `duration` - Estimated time required
- `urgency` - Priority level (low/medium/high)
- `notfall` - Emergency flag (triggers 112 alert)
- `habe_alle_informationen` - Completeness check
- `zusammenfassung` - Summary for voice confirmation

**Special Handling:**
- Detects simple "ja" or "nein" responses for confirmations
- Returns "Unklar" title when audio is unclear
- Never invents information—sets null for uncertain fields

---

### How to run our frontend: 

Clone the project:
Run git clone https://github.com/Markking200/NebenanHelfer.git.

Go into the frontend folder to copy or work with the frontend implementation.

Install dependencies:
Run npm install in the frontend folder.

Start the frontend:
Run npm run dev.

The frontend will run locally on port 5000.

Important: Make sure the backend is running on port 8000 to avoid any issues.

---
### Code Quality
```bash
# Format code
black .

# Sort imports
isort .

# Lint
ruff check .
```

## 📂 Project Structure

```
NebenanHelfer/
├── backend/
│   ├── __init__.py
│   ├── main.py              # Backend FastAPI app
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database schema & connection
│   ├── models/
│   │   ├── user.py          # User Pydantic models
│   │   └── requests.py      # Request Pydantic models
│   ├── routers/
│   │   ├── user.py          # User endpoints
│   │   └── requests.py      # Request endpoints
│   └── utils/
│       └── predefined_users.py  # Seed data
├── main.py                  # Telegram webhook server
├── requirements.txt         # Production dependencies
├── requirements-dev.txt     # Development tools
├── .env                     # Environment variables (not in repo)
├── data.db                  # SQLite database (auto-created)
└── README.md               # This file
```

---

## 🤝 Contributing

This project was built for HackaTUM 2025. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 🐛 Known Issues & Future Improvements

**Current Limitations:**
- Single-user confirmation flow (global state)
- No security code verification implementation
- Address validation requires exact format
- FFmpeg dependency for audio conversion
- No push notifications for students

**Planned Features:**
- [ ] Multi-user concurrent requests (Redis session management)
- [ ] Security code verification endpoint
- [ ] Student mobile app
- [ ] Push notifications (FCM/APNs)
- [ ] Automatic matching algorithm based on location/availability
- [ ] Request history and analytics
- [ ] Multi-language support
- [ ] Integration with calendar apps

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

Built with ❤️ for HackaTUM 2025

