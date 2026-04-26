# OpenCity - Public Event Management & News Portal

## Project Overview
OpenCity is a local MVP web application for managing public events and city news in one dashboard.
It is fully frontend-based: data is stored in browser `localStorage`, with no backend and no authentication.

## Tech Stack
- React
- Vite
- React Router
- Vanilla CSS
- Browser `localStorage` for persistence

## How to Install
```bash
npm install
```

Create `.env.local` in the project root:
```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## How to Run Locally
```bash
npm run dev
```

Then open the local URL shown by Vite (usually `http://localhost:5173`).

## Main Features
- Dashboard home page with:
  - Hero section
  - Live weather widget (OpenWeatherMap API, geolocation with Kyiv fallback)
  - Upcoming active events (up to 5)
  - Latest news (up to 5)
  - Dark/Light mode toggle with persistence
  - Multi-language support (UA/EN/DE) with instant switching
- Events module:
  - List events as cards
  - Search by title/description
  - Filter by category
  - View event details
  - Interactive map on event details (OpenStreetMap + Leaflet)
  - Create, edit, delete events
  - Pick event coordinates by clicking on a map in the Event form
  - Copy event link
- News module:
  - List news as cards
  - View news details
  - Create, edit, delete news
  - Latest news preview on homepage
- Validation and UX:
  - Required field validation for forms
  - Empty states for lists
  - Basic error messages for failed storage operations
  - System-wide dark mode persisted in `localStorage`
  - Selected language persisted in `localStorage`
- Routing:
  - All requested routes are configured, including Not Found page

## Manual Test Checklist
See [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md).

## Known Limitations
- No backend/API integration.
- No user authentication/authorization.
- Weather widget depends on OpenWeatherMap API key and network availability.
- Data is device/browser-specific due to `localStorage`.
- No automated unit/integration test suite yet (manual checklist provided).
