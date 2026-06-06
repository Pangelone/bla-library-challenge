# Thought process

Short notes from while building this. Not a perfect diary, but close enough to how I actually work.

---

## Day 1 - scope

First read was: auth, roles, books, borrowings, dashboards, API, tests, frontend, and the supplementary task API write-up.

My gut said: **do not overbuild**. A solid solution here is mostly about clear boundaries, not microservices.

I started with a monorepo: `backend/` Rails API + `frontend/` React. One GitHub repo as requested in the brief.

---

## Models - first idea vs what I kept

I almost stored `available_copies` on `books`.

Then I thought: every return would need to stay in sync, and tests would get annoying. So I kept `total_copies` and derive availability from active borrowings. Simpler mental model, fewer bugs.

For search I went with `ILIKE` + indexes on title/author/genre. Good enough for this size. If the catalog were huge I would reach for pg_trgm or Elasticsearch, but that felt like overkill for the current scope.

---

## Auth - JWT vs Devise

Devise is fine in production apps I work on daily.

Here I picked **JWT + has_secure_password** because the API is the main deliverable and a small explicit stack is easier to walk through without extra Devise configuration for API-only mode.

Trade-off I accept: logout is client-side (drop token). For stateless APIs that is normal.

---

## Business rules location

Early on I put borrow logic in the controller. Classic mistake.

Moved it to `Borrowings::CreateService` with a transaction + `Book.lock`. Important edge case if two members click Borrow on the last copy at the same time.

Also reordered validations: **duplicate loan check before availability**. Otherwise the error message was confusing in tests (and in real life).

---

## Authorization

Pundit policies instead of giant `if current_user.librarian?` blocks in controllers.

Not because Pundit is magic - it just keeps "who can do what" in one place per resource. Easier to test, easier to explain in a code review.

---

## Frontend

React + Vite, no Redux. Context for auth, fetch wrapper for API.

I thought about TanStack Query for caching. Decided against it for the MVP — would add setup noise without much payoff for a small catalog. If this were production I would probably add it later.

---

## Tests

RSpec request specs for the API contract, model specs for cheap rules, one service spec for the borrow edge case.

I did not chase 100% coverage. I chased **the requirements list** from the PDF.

---

## What I would improve with more time

- Refresh tokens or denylist for JWT logout
- Pagination on `/books` and `/borrowings`
- N+1 audit on dashboard queries (some `includes` are there, but I would benchmark)
- CI pipeline (GitHub Actions) running `rspec` + `npm run build`

---

## Final pass before submission

After the first implementation I re-read the PDF literally and noticed two gaps:

1. **Borrowings CRUD** - I only had index/create/return. Added show, update, destroy on the API plus specs.
2. **RSpec for every requirement** - expanded auth, books, borrowings, dashboards, and both borrow services.

Also added inline comments around auth, borrow transactions, and policy scopes.

---

## UX pass — toasts, loading, actionable vs read-only

First version used plain red `<p className="error">` under the search bar. It worked, but felt cheap and easy to miss.

I almost added a toast library, then backed off — for this codebase size, a tiny `ToastContext` is enough.

Other tweaks from dogfooding:
- Borrow button disappearing when unavailable was confusing → now it stays visible but disabled with a reason.
- Dashboard looked clickable but did nothing → read-only hints + link to Books / Borrowings.
- Search had no feedback → separate "Searching..." state on the button.

Later iteration replaced card lists with tables on Books, Borrowings, and Dashboard for a cleaner scan pattern.

---

## Performance pass — N+1 and indexes

While clicking around the catalog I remembered `available_copies` was doing `borrowings.active.count` **per book**. Fine with 4 seed rows, bad with 4,000.

Fix: `Book.with_availability_counts` uses one SQL subquery in the index endpoint. Second query loads the member's active `book_id`s for the "already on loan" flag.

Indexes already in place from day one:
- `books.title`, `author`, `genre` for ILIKE search
- `borrowings(user_id, book_id, returned_at)` for duplicate-loan checks
- `borrowings.due_at`, `returned_at` for dashboard scopes

Next step if this were production: pagination + `pg_trgm` for fuzzy search + Bullet gem in CI.

---

## Layer map

Quick reference for how responsibilities are split:

- **Controllers** = HTTP translation
- **Services** = business transactions
- **Policies** = authorization
- **Models** = data + small domain helpers

That maps cleanly to layered architecture without over-engineering the folder structure.
