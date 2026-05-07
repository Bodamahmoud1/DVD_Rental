# CineVault — Frontend (React)

The React single-page application for the CineVault DVD Rental System.

## Tech Stack

- **React 19** — UI library
- **React Router DOM 7** — Client-side routing (SPA)
- **Formik + Yup** — Form handling and validation
- **Bootstrap 5** — CSS framework
- **Vite 8** — Build tool and dev server

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:5000` (see backend README)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Opens at: `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx       # Navigation bar with search
│   ├── FilmCard.jsx     # Film catalog card
│   ├── ProtectedRoute.jsx # Auth guard wrapper
│   └── Toast.jsx        # Notification toasts
├── pages/               # Route-level pages
│   ├── Home.jsx         # Landing + catalog browsing
│   ├── FilmDetail.jsx   # Film details + reviews
│   ├── Login.jsx        # Authentication
│   ├── Register.jsx     # Account creation
│   ├── Dashboard.jsx    # User dashboard + rentals
│   └── Profile.jsx      # Profile management
├── context/
│   └── AuthContext.jsx  # Global auth state
├── hooks/
│   └── useToast.js      # Toast notification hook
├── services/
│   └── api.js           # Backend API client
├── data/
│   └── films.js         # Static fallback data
├── App.jsx              # Root component + routing
├── main.jsx             # Entry point
└── index.css            # Global styles + responsive breakpoints
```

## Key Features

- **JWT Authentication** — Secure login/register with token-based auth
- **Film Catalog** — Browse, search, filter by category, pagination
- **Rental System** — Rent DVDs with wallet balance management
- **Dashboard** — KPIs, rental history, wishlist management
- **Profile Management** — Edit info + upload profile picture
- **Reviews** — Submit star ratings and comments on films
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Error Handling** — Toast notifications for all user actions
