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

## Main endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/books?q=search`
- `POST /api/v1/borrowings` (member)
- `PATCH /api/v1/borrowings/:id/return` (librarian)
- `GET /api/v1/dashboard/librarian`
- `GET /api/v1/dashboard/member`

## Demo users

- librarian@library.test / password123
- member@library.test / password123
