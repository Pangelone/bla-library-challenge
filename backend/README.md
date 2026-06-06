# Backend - Library API

Rails 7 API-only app.

## Prerequisites

- Ruby 2.7.5
- PostgreSQL running locally

## Setup (copy/paste)

```bash
cd backend
bundle install
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
bundle exec rails server -p 3000
```

## Tests (copy/paste)

```bash
cd backend
bundle install
bundle exec rails db:create RAILS_ENV=test
bundle exec rails db:migrate RAILS_ENV=test
bundle exec rspec
```

45 specs covering auth, books CRUD, borrowings CRUD, dashboards, and service objects.

## Main endpoints

| Method | Path | Who |
|--------|------|-----|
| POST | /api/v1/auth/register | public |
| POST | /api/v1/auth/login | public |
| DELETE | /api/v1/auth/logout | public |
| GET | /api/v1/books | authenticated |
| POST/PATCH/DELETE | /api/v1/books | librarian |
| GET/POST/PATCH/DELETE | /api/v1/borrowings | member create, librarian update/delete |
| PATCH | /api/v1/borrowings/:id/return | librarian |
| GET | /api/v1/dashboard/librarian | librarian |
| GET | /api/v1/dashboard/member | member |

## Demo users

- librarian@library.test / password123
- member@library.test / password123
