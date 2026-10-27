# AI Research Assistant

**Live Application:** [Open AI Research Assistant](https://ai-research-assistant-frontend-951g.onrender.com)

**Backend API:** [View Backend API](https://ai-research-assistant-api-yj9w.onrender.com)

**API Documentation (Swagger):** [Explore API Documentation](https://ai-research-assistant-api-yj9w.onrender.com/docs)

An AI-powered research assistant built with React, FastAPI, LangChain, Ollama Cloud, and PostgreSQL. The application provides an authenticated web interface for AI-powered research conversations.
## Features

- **User Authentication:** Account registration, login, and token-based authentication.
- **AI Research Chat:** Interact with the configured AI research agent.
- **Streaming Responses:** Receive AI-generated responses through a streaming chat endpoint.
- **Conversation Management:** Work with saved conversations and messages.
- **Analytics:** Access authenticated-user analytics through the analytics API.
- **Research Tools:** Integrates web search and additional utility tools.
- **Database:** PostgreSQL with SQLAlchemy and Alembic migrations.
- **Deployment:** React frontend and FastAPI backend deployed on Render.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI |
| AI Framework | LangChain |
| Language Model | Ollama Cloud |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Authentication | JWT |
| Testing | Pytest |
| Code Quality | ESLint |
| Deployment | Render |
| Version Control | Git and GitHub |

## Architecture

```text
User
  |
  v
React + Vite Frontend
  |
  v
FastAPI Backend
  |
  +--> Authentication and Authorization
  +--> Research Agent and Tools
  +--> Conversation and Message APIs
  +--> Analytics API
  |
  v
PostgreSQL Database

Research Agent --> Ollama Cloud and configured tools
```

## Live Deployment

- **Open the application:** https://ai-research-assistant-frontend-951g.onrender.com
- **Backend health check:** https://ai-research-assistant-api-yj9w.onrender.com/health
- **Interactive API documentation:** https://ai-research-assistant-api-yj9w.onrender.com/docs

The application and backend are hosted separately. The deployed backend uses its configured environment variables and database.

## Prerequisites

Install the following before running the project locally:

- Python
- Node.js and npm
- PostgreSQL
- An Ollama Cloud API key

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Shubhamspc90/ai-research-assistant.git
cd ai-research-assistant
```

### 2. Configure the Python environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
```

### 3. Configure environment variables

Create a local `.env` file using `.env.example` as a template.

Configure the required values:

- `OLLAMA_API_KEY`
- `OLLAMA_MODEL`
- `OLLAMA_BASE_URL`
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

For local development, configure `DATABASE_URL` to point to your local PostgreSQL database. The example file uses port `5433`.

**Security:** Never commit `.env` files, API keys, database passwords, JWT secrets, or access tokens.

### 4. Start the backend

From the repository root, with the Python virtual environment activated:

```powershell
python -m uvicorn backend.app.main:app --reload
```

The local API should be available at `http://127.0.0.1:8000`, with interactive documentation at `http://127.0.0.1:8000/docs`.

Ensure that the database is configured and the required migrations have been applied before testing database-dependent endpoints.

### 5. Start the frontend

Open a second terminal in the repository root:

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
```

Open the local URL printed by Vite in the terminal.

Configure the frontend's API base URL according to the project's frontend configuration and the backend environment you intend to use.

## Testing and Validation

### Backend tests

```powershell
python -m pytest -q
```

### Frontend lint

```powershell
npm --prefix frontend run lint
```

### Frontend production build

```powershell
npm --prefix frontend run build
```

## API Endpoints

The backend exposes endpoints for health checks, authentication, chat, conversation management, messages, and analytics.

| Endpoint | Purpose |
|---|---|
| `GET /` | API root information |
| `GET /health` | Backend health check |
| `POST /chat` | Authenticated chat request |
| `POST /chat/stream` | Authenticated streaming chat |
| `GET /analytics/overview` | Authenticated analytics overview |

For the complete list of routes, request schemas, and response formats, visit the [Swagger API Documentation](https://ai-research-assistant-api-yj9w.onrender.com/docs).

## Project Structure

```text
ai-research-assistant/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── tools/
│   ├── alembic/
│   └── requirements.txt
├── frontend/
├── tests/
├── docs/
├── .env.example
├── .gitignore
├── alembic.ini
└── README.md
```

## Environment and Deployment Notes

- Keep local secrets in `.env`; use the hosting platform's environment-variable settings for deployed services.
- Configure backend CORS to allow the intended frontend origin.
- Configure the frontend to call the correct backend API URL.
- Local and deployed databases are separate unless explicitly configured otherwise.
- Back up important database data and check your hosting provider's database retention and expiry policies.

## Development Workflow

This project uses Git and GitHub for version control. Development changes should be made on focused feature or documentation branches, validated locally, committed with descriptive messages, and submitted through pull requests before merging into `main`.

## Project Status

The application has been deployed to Render. Backend tests, frontend linting, production build, authentication, and key application flows have been checked during project validation. See the latest repository history for ongoing changes.

## License

A license has not yet been specified for this repository.

---

## Author

**Shubham Chauhan**

GitHub: [Shubhamspc90](https://github.com/Shubhamspc90)