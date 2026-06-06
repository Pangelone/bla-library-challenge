# Frontend - Library UI

React + Vite client for the Rails API.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Default API URL: `http://localhost:3000/api/v1`

## Scripts

- `npm run dev` - local dev server (port 5173)
- `npm run build` - production build
- `npm run preview` - preview build

## Notes

Auth token is stored in `localStorage` under `library_token`. Logout clears it client-side (stateless JWT).
