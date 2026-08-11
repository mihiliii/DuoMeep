# DuoMeep

DuoMeep is a social platform built to help gamers find partners with matching interests and similar skill levels. The goal is to make it easy to connect with the right people - no more solo queue frustration. Currently focused on [League of Legends](https://www.leagueoflegends.com/).

## 🧰 Tech Stack

| Layer    | Technology                               |
|----------|------------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend  | Node.js, Express 5, TypeScript           |
| Database | MongoDB 7, Mongoose, migrate-mongo       |
| Auth     | Argon2                                   |
| DevOps   | Docker, Docker Compose                   |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (v29 or higher)
- [Node.js](https://nodejs.org/) (v25 or higher) - only needed locally for IDE type checking, not for running the app
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (v11 or higher) - same as above

## 🚀 Quick Start

```bash
git clone https://github.com/mihiliii/DuoMeep.git
cd DuoMeep
docker compose up -d --build
```

Docker Compose will spin up four services in the correct order: MongoDB starts first, the `migrate` service applies database migrations and exits, then the backend and frontend come up.

Once running, you can access services at their default ports:

- **Frontend** - `http://localhost:5173`
- **Backend API** - `http://localhost:4000`
- **MongoDB** - `localhost:27017`

To stop services:

```bash
docker compose down
```

## 🏗️ Project Structure

```text
DuoMeep/
├── backend/
│   ├── migrations/               # migrate-mongo migration scripts
│   ├── migrate-mongo-config.js   # Migration tool configuration
│   ├── public/                   # Static assets served by Express
│   ├── uploads/                  # User-uploaded avatars and banners
│   └── src/
│       ├── config/               # Database connection and multer setup
│       ├── controllers/          # Route handlers
│       ├── enums/                # Shared enums
│       ├── errors/               # AppError class
│       ├── middleware/           # Express error handler
│       ├── models/               # Mongoose schemas
│       ├── routes/               # Express route definitions
│       ├── services/             # Business logic and database access
│       ├── types/                # Shared TypeScript types
│       ├── utils/                # Date, regex and zod helpers
│       ├── validators/           # Zod request schemas
│       └── server.ts             # Application entry point
├── frontend/
│   └── src/
│       ├── assets/               # Images
│       ├── components/           # Reusable UI
│       ├── config/               # API base URL
│       ├── context/              # Session context provider
│       ├── hooks/                # Custom hooks
│       ├── pages/                # Route-level views
│       │   ├── admin/            # Admin login and panel
│       │   ├── auth/             # Login and signup
│       │   ├── dashboard/        # User dashboard
│       │   ├── home/             # Landing page
│       │   ├── match-me/         # Match Me listings
│       │   ├── messages/         # Chat
│       │   ├── settings/         # Account settings
│       │   └── page-not-found/   # 404
│       ├── services/             # API service layer
│       ├── types/                # TypeScript interfaces
│       ├── App.tsx               # Route definitions
│       └── main.tsx              # Application entry point
└── compose.yaml
```

## 🛠️ Development

Both `backend/src` and `frontend/src` are mounted as volumes in Docker, so changes to source files are picked up automatically without rebuilding the image.

To install dependencies locally for IDE type checking:

```bash
cd backend && npm install
cd frontend && npm install
```

## 🗄️ Database

### MongoDB Configuration

- **Host**: `mongodb:27017` on the Docker network / `localhost:${MONGO_PORT}` from the host
- **Database**: set by `MONGO_DATABASE`
- **Credentials**: set by `MONGO_USERNAME` and `MONGO_PASSWORD`

### Migrations

Database migrations are managed with [migrate-mongo](https://github.com/seppevs/migrate-mongo) and run automatically on startup via the one-shot `migrate` service. Migration scripts live in `backend/migrations/`, are sorted by filename, and each exports an `up` and a `down` function receiving the MongoDB driver's `Db` instance. Applied migrations are tracked in the `changelog` collection.

Run migrations manually against the running stack:

```bash
docker compose run --rm migrate npx migrate-mongo status
docker compose run --rm migrate npx migrate-mongo up
docker compose run --rm migrate npx migrate-mongo down
docker compose run --rm migrate npx migrate-mongo create add_something
```

### Seeded Accounts

| Username | Email            | Password   |
|----------|------------------|------------|
| `mihi`   | `mihi@test.com`  | `Test1233` |
| `laza`   | `laza@test.com`  | `Laza1234` |
| `anja`   | `anja@test.com`  | `Anja1234` |
| `paja`   | `paja@test.com`  | `Paja1234` |
| `ghost`  | `ghost@test.com` | `Ghost123` |
| `elena`  | `elena@test.com` | `Elena123` |
| `djole`  | `djole@test.com` | `Djole123` |
| `zile`   | `zile@test.com`  | `Zile1234` |
| `keka`   | `keka@test.com`  | `Keka1234` |

The admin panel uses test admin account with username `admin` and password `admin`.

## ⚙️ Environment Variables

`compose.yaml` falls back to the defaults below when nothing is set, so the stack runs straight after cloning. To change any of them, copy the template and edit your own copy `.env`

```bash
cp .env.example .env
```

| Variable         | Default                                          | Description                                                        |
|------------------|--------------------------------------------------|--------------------------------------------------------------------|
| `API_PORT`       | `4000`                                           | Host port the backend is published on                              |
| `FRONTEND_PORT`  | `5173`                                           | Host port the Vite dev server is published on                      |
| `MONGO_PORT`     | `27017`                                          | Host port MongoDB is published on                                  |
| `MONGO_USERNAME` | `admin`                                          | MongoDB root user, created when the database volume is initialised |
| `MONGO_PASSWORD` | `password123`                                    | Password for root user                                             |
| `MONGO_DATABASE` | `duomeep_db`                                     | Database name, used by the app and the migration runner            |
| `MONGO_URI`      | built from `MONGO_USERNAME` and `MONGO_PASSWORD` | Connection string used by the backend and the migration runner     |
| `VITE_API_URL`   | built from `API_PORT`                            | Backend API address, inlined into the browser bundle by Vite       |

The three `*_PORT` variables change only the host side of each mapping. Inside the Docker network the containers always listen on `4000`, `5173` and `27017`.

`MONGO_URI` and `VITE_API_URL` are derived rather than fixed - `.env.example` builds them from the variables above with `${...}` references, which Compose expands top to bottom, so changing a port or a password carries through.

`MONGO_USERNAME` and `MONGO_PASSWORD` only take effect on a database volume that has not been initialised yet. Changing them against an existing volume leaves the old credentials in place and authentication fails; run `docker compose down -v` to recreate the database.

## 📝 Available Scripts

### Backend

```bash
npm run dev             # Development mode with watch
npm run migrate:up      # Apply pending migrations
npm run migrate:down    # Roll back the last migration
npm run migrate:status  # Show applied and pending migrations
npm run migrate:create  # Scaffold a new migration
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```
