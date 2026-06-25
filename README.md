# LeetCode Progress Analyzer

A modern full-stack web application to analyze LeetCode profiles, discover weak topics, get AI-powered recommendations, and build personalized study plans.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS v3 + Recharts + Lucide Icons
- **Backend**: FastAPI (Python) + SQLite + SQLAlchemy
- **API**: LeetCode Public GraphQL API (with mock fallback)

## Project Structure
```
leetcode-progress-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── database.py      # SQLAlchemy + SQLite config
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── leetcode_api.py  # LeetCode GraphQL integration
│   │   ├── recommender.py   # Recommendation engine
│   │   ├── planner.py       # AI study planner
│   │   └── routers/         # API route handlers
│   │       ├── profile.py
│   │       ├── recommendations.py
│   │       ├── compare.py
│   │       └── planner.py
│   ├── seed_data.py         # 94 curated LeetCode problems
│   ├── requirements.txt
│   └── start.bat            # Windows start script
└── frontend/
    ├── src/
    │   ├── components/      # Layout + UI components
    │   ├── context/         # Theme + User contexts
    │   ├── pages/           # All 7 pages
    │   ├── services/        # Axios API layer
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    └── .env
```

## Quick Start

### 1. Start the Backend
```cmd
cd backend
python seed_data.py      # Seed 94 LeetCode problems into SQLite
uvicorn app.main:app --reload --port 8000
```
Or just double-click `backend/start.bat`

API docs available at: http://localhost:8000/docs

### 2. Start the Frontend
```cmd
cd frontend
npm run dev
```
Open: http://localhost:5173

## Features
| Page | Description |
|------|-------------|
| 🏠 Home | Landing page with username search |
| 📊 Dashboard | Profile stats, heatmap, weak topics |
| 📈 Analysis | Topic-wise radar/bar charts |
| 💡 Recommendations | Problems filtered by company & difficulty |
| 📚 AI Planner | Day-by-day study roadmap |
| 📉 Tracker | Historical progress charts |
| ⚔️ Compare | Side-by-side user comparison |

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/{username}` | Full analytics for a user |
| GET | `/api/recommendations/{username}` | Personalized problem recs |
| GET | `/api/recommendations/company/{company}` | Company-tagged problems |
| POST | `/api/planner/generate` | Generate study plan |
| POST | `/api/compare/` | Compare two users |

## Deployment
- **Frontend** → Deploy `frontend/` to Netlify (`npm run build`)
- **Backend** → Deploy `backend/` to Render (set `uvicorn app.main:app`)
- Update `frontend/.env` → `VITE_API_URL=https://your-render-url.onrender.com`
