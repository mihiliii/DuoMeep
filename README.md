# DuoMeep

DuoMeep is a social platform built to help gamers find partners with matching interests and similar skill levels. The goal is to make it easy to connect with the right people — no more solo queue frustration. Currently focused on [League of Legends](https://www.leagueoflegends.com/).

## 🧰 Tech Stack

| Layer    | Technology                               |
|----------|------------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend  | Node.js, Express 5, TypeScript           |
| Database | MongoDB 7, Mongoose, Flyway (migrations) |
| Auth     | JWT, Argon2                              |
| DevOps   | Docker, Docker Compose                   |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (v29 or higher)
- [Node.js](https://nodejs.org/) (v25 or higher) — only needed locally for IDE type checking, not for running the app
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (v11 or higher) — same as above

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/mihiliii/DuoMeep.git
cd DuoMeep
```

### 2. Start the application

```bash
docker compose up -d --build
```

Docker Compose will spin up four services in the correct order: MongoDB starts first, Flyway runs database migrations, then the backend and frontend come up.

Once running, you can access services:

- **Frontend** — `http://localhost:5173`
- **Backend API** — `http://localhost:4000/api`
- **MongoDB** — `localhost:27017`

To stop services:

```bash
docker compose down
```

## 🏗️ Project Structure

```text
DuoMeep/
├── backend/
│   └── src/
│       ├── config/        # Database and file upload config
│       ├── controllers/   # Route handlers (account, user, matchme)
│       ├── db/            # Flyway migration scripts
│       ├── middleware/     # JWT auth middleware
│       ├── models/        # Mongoose schemas
│       └── routes/        # Express route definitions
├── frontend/
│   └── src/
│       ├── components/    # Shared UI components (navbar, etc.)
│       ├── pages/         # Page-level components (home, auth, dashboard)
│       ├── services/      # API service layer
│       └── models/        # TypeScript interfaces
├── containers/
│   └── flyway/            # Flyway Docker image config
└── compose.yaml
```

## 🛠️ Development

Both `backend/src` and `frontend/src` are mounted as volumes in Docker, so changes to source files are picked up automatically without rebuilding the image.

To install dependencies locally for IDE type checking:

```bash
cd backend && npm install
cd frontend && npm install
```

Useful Docker Compose commands during development:

```bash
# Follow logs from all services
docker compose logs -f

# Follow logs from a specific service
docker compose logs -f backend

# Restart a single service
docker compose restart backend

# Rebuild and restart after Dockerfile changes
docker compose up -d --build
```

## 🗄️ Database

### MongoDB Configuration

- **Host**: `mongodb` (internal Docker network) / `localhost:27017` (external)
- **Database**: `duomeep_db`
- **Username**: `admin`
- **Password**: `password123`

### Migrations

Database migrations are managed with Flyway and run automatically on startup. Migration scripts live in `backend/src/db/` and follow the naming convention `V{version}__{description}.js` (e.g. `V1__initial_collections.js`).

## ⚙️ Environment Variables

These are pre-configured in `compose.yaml` for local development:

| Variable       | Service  | Value                                                                   |
|----------------|----------|-------------------------------------------------------------------------|
| `MONGO_URI`    | Backend  | `mongodb://admin:password123@mongodb:27017/duomeep_db?authSource=admin` |
| `API_PORT`     | Backend  | `4000`                                                                  |
| `VITE_API_URL` | Frontend | `http://localhost:4000`                                                 |

## 📝 Available Scripts

### Backend

```bash
npm run dev      # Development mode with watch
npm run build    # Compile TypeScript
npm start        # Run production build
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Remove containers and volumes (also clears the database)
docker compose down -v

# Rebuild from scratch
docker compose up --build
```

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker logs duomeep-mongodb

# Restart MongoDB
docker compose restart mongodb
```

### IDE TypeScript Errors (e.g. "Cannot find type definition file for 'node'")

Run `npm install` locally in each package — the IDE needs `node_modules` to resolve types. This has no effect on how the app runs inside Docker.

```bash
cd backend && npm install
cd frontend && npm install
```
