# BLA Library Management System

Monorepo for the Ballast Lane Applications technical exercise.

- `backend/` - Rails 7 API (auth, books, borrowings, dashboards, RSpec)
- `frontend/` - React + Vite UI
- `docs/` - user story, thought process, task API sample

## Demo credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Librarian | librarian@library.test | password123 |
| Member | member@library.test | password123 |

## Backend setup

```bash
cd backend
bundle install
# if bundle exec fails on Ruby 2.7, install date/timeout into vendor/bundle first
createdb bla_library_development
createdb bla_library_test
bundle exec rails db:migrate
bundle exec rails db:seed
bundle exec rails server -p 3000
```

Run tests:

```bash
bundle exec rspec
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Architecture (quick)

- JWT auth, Pundit policies
- Service objects for borrow/return transactions
- REST API under `/api/v1`
- React client with a small fetch wrapper

See `docs/THOUGHT_PROCESS.md` for decisions and trade-offs.
