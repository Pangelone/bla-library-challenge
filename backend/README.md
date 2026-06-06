# Backend - Library API

Rails 7 API-only app.

## Setup

```bash
bundle install
createdb bla_library_development
createdb bla_library_test
bundle exec rails db:migrate
bundle exec rails db:seed
bundle exec rails server -p 3000
```

## Tests

```bash
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
