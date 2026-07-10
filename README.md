# EcoStay Explorer

Sustainable hospitality platform — Next.js frontend + FastAPI backend with MongoDB Atlas.

## Structure

```
├── frontend/   # Next.js (Week 1–3 UI)
├── backend/    # FastAPI + Motor
├── .env        # Secrets (not committed)
└── .env.example
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas cluster (or local MongoDB)

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Set `MONGO_URI`, `JWT_SECRET`, and optional `GEMINI_API_KEY` in `.env`.

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## API Endpoints

| Route | Description |
|-------|-------------|
| `GET /api/health` | Health check |
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/stays` | Eco-stay listings |
| `GET /api/reservations` | Upcoming reservations |
| `GET /api/ai-metrics` | Sustainability metrics |
| `POST /api/ai-metrics/analyze` | Gemini sustainability analysis |

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Backend:** FastAPI, Motor, Pydantic, JWT, Passlib
- **Database:** MongoDB Atlas

## Database Setup
1. Create a MongoDB cluster on MongoDB Atlas.
2. Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_connection_string_here