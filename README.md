# BLA Library Management System

Monorepo for the Ballast Lane Applications technical exercise.

- `backend/` - Rails 7 API (auth, books, borrowings, dashboards, RSpec)
- `frontend/` - React + Vite UI
- `docs/` - submission write-ups (required by BLA)

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/USER_STORY.md](docs/USER_STORY.md) | Informal user story from the brief |
| [docs/THOUGHT_PROCESS.md](docs/THOUGHT_PROCESS.md) | How I approached the build (design notes) |
| [docs/GENAI_EXERCISE.md](docs/GENAI_EXERCISE.md) | Supplementary task API design (backend-only, required by brief) |

Public repo: https://github.com/Pangelone/bla-library-challenge

## Demo credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Librarian | librarian@library.test | password123 |
| Member | member@library.test | password123 |

## Prerequisites

- Ruby 2.7.5
- PostgreSQL running locally
- Node.js 18+ and npm

## Backend setup (copy/paste)

```bash
cd backend
bundle install
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
bundle exec rails server -p 3000
```

API runs at http://localhost:3000

## Backend tests (copy/paste)

```bash
cd backend
bundle install
bundle exec rails db:create RAILS_ENV=test
bundle exec rails db:migrate RAILS_ENV=test
bundle exec rspec
```

## Frontend setup (copy/paste)

Open a **second terminal** while the API is running:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

The frontend proxies `/api` to the Rails server (see `frontend/vite.config.js`), so you should not hit CORS issues in local dev.

## Full local run (quick reference)

Terminal 1:

```bash
cd backend && bundle install && bundle exec rails db:create db:migrate db:seed && bundle exec rails server -p 3000
```

Terminal 2:

```bash
cd frontend && npm install && cp .env.example .env && npm run dev
```

## Architecture (quick)

- JWT auth, Pundit policies, policy scopes on borrowings
- Service objects for borrow/return transactions (row lock on last copy)
- REST CRUD for books and borrowings under `/api/v1`
- React client with a small fetch wrapper

See `docs/THOUGHT_PROCESS.md` for decisions and trade-offs.
