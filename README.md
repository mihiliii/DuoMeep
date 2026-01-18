# MERN Stack Application

A full-stack web application built with MongoDB, Express, React, and Node.js (MERN stack), featuring Docker containerization for easy deployment and development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Option 1: With Docker Compose

- [Docker](https://www.docker.com/get-started) (v20.10 or higher)

### Option 2: Without Docker

- [Node.js](https://nodejs.org/) (v20 or higher)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/) (v7.0 or higher)
- npm

## 🏗️ Project Structure

```
.
├── compose.yaml              # Docker Compose configuration
├── backend/                  # Express API server
│   ├── dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts        # Main server entry point
│       ├── config/
│       │   └── db.ts        # MongoDB connection
│       ├── controllers/     # Route controllers
│       ├── models/          # Mongoose models
│       │   └── User.ts
│       └── routes/          # API routes
│
└── frontend/                # React application
    ├── dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx          # Main React component
        ├── main.tsx         # Application entry point
        └── assets/          # Static assets
```

## 🚀 Quick Start

### Option 1: With Docker Compose

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd slo
```

#### 2. Start the application

```bash
docker compose up -d
```

This will start three services:

- **MongoDB** on `localhost:27017`
- **Frontend** on `localhost:5173`
- **Backend API** on `localhost:5000`

#### 3. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### Option 2: Without Docker (Local Development)

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd slo
```

#### 2. Setup MongoDB

Ensure MongoDB is running on your local machine:

```bash
# Start MongoDB service (Linux/macOS)
sudo systemctl start mongod

# Or using Homebrew on macOS
brew services start mongodb-community

# Or run MongoDB directly
mongod --dbpath /path/to/your/data/directory
```

#### 3. Install and run Backend

```bash
cd backend
npm install

# Start the backend server
npm run dev
```

The backend will be running on http://localhost:5000

#### 4. Install and run Frontend

Open a new terminal:

```bash
cd frontend
npm install

# Start the frontend development server
npm run dev
```

The frontend will be running on http://localhost:5173

## 🛠️ Development

### With Docker Compose

The Docker Compose setup includes volume mounts for hot-reloading during development:

```bash
# Start all services
docker compose up

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Without Docker

Run backend and frontend in separate terminals with hot-reloading:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
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
# Remove all containers and volumes
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
