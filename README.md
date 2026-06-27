# StudentHub 🎓

A full-stack student management platform built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4, React Router |
| HTTP      | Axios (with JWT interceptors)                 |
| Backend   | Node.js, Express 5                            |
| Database  | MongoDB + Mongoose                            |
| Auth      | JWT (access + refresh tokens)                 |
| Security  | Helmet, CORS, bcryptjs                        |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1 – Clone & install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2 – Environment variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3 – Run development servers

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173) – in a new terminal
cd frontend
npm run dev
```

---

## Project Structure

```
StudentHub/
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── assets/            # images, icons
│   │   ├── components/
│   │   │   ├── common/        # reusable UI atoms (Button, Input, Modal…)
│   │   │   └── layout/        # Navbar, Sidebar, Footer…
│   │   ├── context/           # React Context providers (Auth, Theme…)
│   │   ├── hooks/             # custom hooks (useAuth, useFetch…)
│   │   ├── pages/
│   │   │   ├── auth/          # Login, Register, ForgotPassword
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── assignments/
│   │   │   ├── grades/
│   │   │   └── profile/
│   │   ├── services/
│   │   │   └── api.js         # Axios singleton
│   │   ├── styles/            # global / component CSS
│   │   └── utils/             # helpers, constants, formatters
│   ├── .env
│   └── vite.config.js
│
└── backend/                   # Express MVC API
    ├── src/
    │   ├── config/
    │   │   └── db.js          # MongoDB connection
    │   ├── controllers/       # request handlers
    │   ├── middleware/
    │   │   ├── authMiddleware.js
    │   │   └── validate.js
    │   ├── models/            # Mongoose schemas
    │   ├── routes/            # Express routers
    │   ├── utils/
    │   │   ├── ApiError.js
    │   │   ├── asyncHandler.js
    │   │   └── responseHandler.js
    │   ├── validators/        # express-validator rule sets
    │   └── app.js             # Express entry point
    └── .env
```

---

## API Endpoints (planned)

| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | `/api/auth/register`      | Register new user    |
| POST   | `/api/auth/login`         | Login + JWT          |
| GET    | `/api/users/me`           | Current user profile |
| GET    | `/api/courses`            | List courses         |
| GET    | `/api/assignments`        | List assignments     |
| GET    | `/api/grades`             | View grades          |
| GET    | `/api/health`             | Health check         |
