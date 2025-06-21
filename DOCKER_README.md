# Docker Setup for IAMAFK

This document explains how to run the IAMAFK application using Docker.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Build and start the application:**
 ```bash
 docker-compose up --build
 ```

2. **Access the application:**
 - Frontend: http://localhost
 - Backend API: http://localhost:3001

3. **Stop the application:**
 ```bash
 docker-compose down
 ```

## Architecture

The application consists of two services:

### Client (Frontend)
- **Port:** 80
- **Technology:** React + TypeScript + Vite
- **Container:** nginx-alpine (serves built React app)
- **Build:** Multi-stage Docker build

### Server (Backend)
- **Port:** 3001
- **Technology:** Node.js + Express + Socket.IO
- **Container:** node:18-alpine
- **Data:** Persistent volume for furniture and user activity data

## Environment Variables

### Client
- `VITE_SERVER_URL`: URL of the server (default: http://localhost:3001)

### Server
- `NODE_ENV`: Environment (default: production)
- `PORT`: Server port (default: 3001)

## Data Persistence

The server data is stored in a Docker volume:
- **Volume name:** `iamafk_server-data`
- **Location:** `/app/data` in the server container
- **Files:**
- `furniture.json`: Furniture placement data
- `user_activity.json`: User activity tracking

## Development vs Production

### Development
For local development without Docker:
```bash
# Terminal 1 - Start server
cd server
npm install
node server.js

# Terminal 2 - Start client
cd client
npm install
npm run dev
```

### Production (Docker)
```bash
# Build and run with Docker
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f client
docker-compose logs -f server
```

### Access containers
```bash
# Access client container
docker-compose exec client sh

# Access server container
docker-compose exec server sh
```

### Rebuild specific service
```bash
# Rebuild client only
docker-compose build client

# Rebuild server only
docker-compose build server
```

### Clean up
```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Troubleshooting

### Port conflicts
If ports 80 or 3001 are already in use, modify the `docker-compose.yml` file:
```yaml
ports:
- "8080:80"# Change 80 to 8080
- "3002:3001"# Change 3001 to 3002
```

### Permission issues
If you encounter permission issues with the data volume:
```bash
# Create volume with proper permissions
docker volume create iamafk_server-data
```

### Build issues
If the build fails, try cleaning up and rebuilding:
```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

## Network Configuration

The services communicate over a custom Docker network:
- **Network name:** `iamafk_iamafk-network`
- **Client → Server:** `http://server:3001`
- **External access:** `http://localhost` (client) and `http://localhost:3001` (server)

## Security Notes

- The application is configured for development use
- For production deployment, consider:
- Using HTTPS
- Implementing proper authentication
- Configuring CORS properly
- Using environment variables for sensitive data 