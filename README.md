# 🎙️ Linguofy

<p align="center">
  <strong>Turn your voice into clear, useful conversations.</strong><br />
  Record speech, transcribe it, translate it, summarize it, and ask an AI agent follow-up questions—all in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Flask-3-000000?logo=flask&logoColor=white" alt="Flask 3" />
  <img src="https://img.shields.io/badge/Whisper-faster--whisper-00A67E" alt="faster-whisper" />
  <img src="https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?logo=googlegemini&logoColor=white" alt="Gemini 2.0 Flash" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

---

## ✨ What Linguofy can do

- 🎤 **Record and transcribe** speech directly from the browser.
- 🌍 **Translate** transcriptions into English.
- 🧠 **Summarize and clean up** recorded conversations with Gemini.
- 🤖 **Talk to an AI agent** using either voice or text, with text-to-speech playback for responses.
- 🗂️ **Save, revisit, and edit** transcription history for each user.
- 🔐 **Create accounts and sign in** with securely hashed passwords.

## 🏗️ Architecture

```mermaid
flowchart LR
    User([User]) --> UI["React + Vite frontend"]

    UI -->|"Sign up / log in"| Auth["Flask API"]
    UI -->|"WebM voice recording"| Transcribe["/transcribe or /agent"]
    UI -->|"Text prompt"| AgentText["/agenttext"]
    UI -->|"Save / view history"| History["History endpoints"]

    Auth --> Mongo[("MongoDB\nusers + history")]
    History --> Mongo

    Transcribe --> Audio["Audio conversion\nPyDub + SoundFile"]
    Audio --> Whisper["faster-whisper\nbase model"]
    Whisper --> Gemini["Gemini 2.0 Flash"]
    AgentText --> Gemini
    Gemini --> UI
    Whisper --> UI
```

### How a voice request flows

1. The browser records audio with the MediaRecorder API and sends a WebM file to Flask.
2. Flask converts and resamples the audio to 16 kHz, then transcribes it with faster-whisper.
3. For agent requests, the transcription is sent to Gemini for a direct response; recent responses are cached in memory.
4. The frontend displays the result and can read agent responses aloud with the browser Speech Synthesis API.

## 🧰 Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, React Icons |
| Backend | Python, Flask, Flask-CORS, Flask-Bcrypt |
| Speech | faster-whisper, PyDub, Librosa, SoundFile |
| AI | Google Gemini 2.0 Flash via `google-genai` |
| Data | MongoDB with PyMongo |

## 🚀 Get started

### Prerequisites

- Node.js and npm
- Python 3
- A MongoDB Atlas database
- A Google AI API key with Gemini access
- FFmpeg installed and available on your `PATH` for WebM audio conversion

### 1. Configure environment variables

Create `backend/.env` and add your credentials:

```env
GOOGLE_KEY=your_google_ai_api_key
MONGO_URL=mongodb+srv://your_mongodb_username:your_password@your-cluster.mongodb.net/?retryWrites=true&w=majority
```

> `backend/.env` is intentionally ignored by Git. Never commit real API keys or database passwords.

### 2. Start the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment, then install and run the API:

```bash
pip install -r requirements.txt
python app.py
```

The Flask API starts at `http://127.0.0.1:5000`.

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite—normally `http://localhost:5173`—and create an account to begin.

## 🔌 API overview

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/signup` | `POST` | Create a user account |
| `/login` | `POST` | Authenticate a user |
| `/transcribe` | `POST` | Transcribe an uploaded audio file |
| `/translate` | `POST` | Translate a transcription to English |
| `/save_transcription` | `POST` | Generate a summary and save it to history |
| `/get_history` | `POST` | Retrieve a user's saved history |
| `/update_history` | `PUT` | Update a saved history item |
| `/agent` | `POST` | Transcribe voice and receive an AI response |
| `/agenttext` | `POST` | Receive an AI response to a text prompt |

## 📁 Project structure

```text
.
├── backend/
│   ├── app.py                 # Flask application and API routes
│   ├── requirements.txt       # Python dependencies
│   └── finetune.ipynb         # Model experimentation notebook
├── frontend/
│   ├── src/
│   │   ├── components/        # Auth, recorder, history, and agent UI
│   │   └── App.jsx            # Application routes
│   └── package.json           # Frontend scripts and dependencies
└── README.md
```

## 🗺️ Next ideas

- Add JWT-based sessions instead of browser-only route protection.
- Move API URLs into environment configuration for easy deployment.
- Add a language selector and preserve the detected spoken language.
- Store audio files securely alongside transcription history.
- Add tests for Flask endpoints and critical frontend flows.

---

<p align="center">Built for clearer conversations, one recording at a time. ✨</p>
