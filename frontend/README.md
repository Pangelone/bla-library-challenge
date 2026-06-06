# Frontend - Library UI

React + Vite client for the Rails API.

## Prerequisites

- Node.js 18+
- Backend API running on http://localhost:3000

## Setup (copy/paste)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Production build (copy/paste)

```bash
cd frontend
npm install
npm run build
npm run preview
```

Default API URL: `/api/v1` (proxied to Rails by Vite in dev — see `vite.config.js`)

## Notes

Auth token is stored in `localStorage` under `library_token`. Logout clears it client-side (stateless JWT).
