# DuoMeep

A full-stack web application built with MongoDB, Express, React, and Node.js (MERN stack), featuring Docker containerization for easy deployment and development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (v20.10 or higher)
- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (v10 or higher)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/) (v7.0 or higher)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/mihiliii/DuoMeep.git
cd DuoMeep
```

### 2. Start the application

```bash
docker compose up -d
```

This will start three services:

- **MongoDB** on `localhost:27017`
- **Frontend** on `localhost:5173`
- **Backend API** on `localhost:5000`

### 3. Access the application

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

## 🛠️ Development

The Docker Compose setup includes volume mounts for hot-reloading during development:

```bash
# Start all services
docker compose up

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## 🗄️ Database

### MongoDB Configuration

- **Host**: mongodb (internal) or localhost:27017 (external)
- **Database**: mern_db
- **Username**: admin
- **Password**: password123

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
# Remove all containers and volumes (also removes database, use with caution)
docker compose down -v

# Rebuild and restart
docker compose up --build
```

### MongoDB Connection Issues

```bash
# Check MongoDB container logs
docker logs mern-mongodb

# Restart MongoDB
docker compose restart mongodb
```
