# Feed Management & Reservation App

FastAPI backend + React (Vite) frontend. Backend runs on port **8080**, frontend on **5173** (or next free port).

## Run the project

From the project root:

```bash
npm install
npm run run
```

This starts both the backend and frontend. Open **http://localhost:5173** (or the port shown in the terminal).

- **Backend**: http://127.0.0.1:8080 (API docs: http://127.0.0.1:8080/docs)
- **Frontend**: proxied to backend at `/api`

## First-time setup

1. **Backend**: Create a virtualenv and install deps (if not already done).
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```
2. **Seed the database** (creates admin user and sample feed types):
   ```bash
   cd backend
   .\venv\Scripts\activate
   python seed_db.py
   cd ..
   ```
   Admin login: National ID = **admin**, Password = **admin123**.

3. **Frontend**: Install deps (if not already done).
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Scripts (root)

| Command | Description |
|--------|-------------|
| `npm run run` | Start backend + frontend together |
| `npm run run:backend` | Start only backend (port 8080) |
| `npm run run:frontend` | Start only frontend |

If the backend runs on a different port, create `frontend/.env` with `VITE_BACKEND_PORT=8000` (or your port) and restart the frontend.
"# feeds" 
