# Docker Port Manager

A web application for managing and monitoring Docker container ports on your server. This application runs in a Docker container stack and provides a clean interface to:

- View all used ports from running Docker containers
- Search for specific ports or containers
- Check if a port is available
- Generate random free ports

## Features

- **Port Discovery**: Automatically scans all running Docker containers to find used ports
- **Search Functionality**: Search by port number, container name, or image name
- **Port Availability Check**: Check if a specific port is free or in use
- **Random Port Generation**: Get a random available port in the 3000-9999 range
- **Real-time Data**: Refresh button to get the latest container information
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

1. Clone this repository to your server
2. Make sure Docker and Docker Compose are installed
3. Build and run the application:

```bash
# Build and start all services
docker-compose up --build -d

# Check if services are running
docker-compose ps

# View logs if needed
docker-compose logs -f
```

4. Access the application at `http://your-server-ip:8080`

The application will be available at:

- **Frontend**: `http://your-server-ip:8080`
- **Backend API**: `http://your-server-ip:3001`
- **Health Check**: `http://your-server-ip:3001/api/health`

## Architecture

- **Frontend**: React + Tailwind CSS (served by Nginx)
- **Backend**: Node.js + Express API
- **Docker Integration**: Uses Docker socket to communicate with Docker daemon

The frontend uses relative API paths that are proxied through Nginx to the backend, ensuring it works correctly when deployed on any server.

## API Endpoints

- `GET /api/ports` - Get all used ports and container information
- `GET /api/ports/:port/check` - Check if a specific port is available
- `GET /api/ports/random` - Get a random available port

## Security Notes

- The backend container has read-only access to the Docker socket
- Only port information is exposed, no container control capabilities
- Runs on internal Docker network with minimal exposed ports

## Deployment Instructions

### On Your Server

1. Copy all files to your server
2. Run: `docker-compose up -d`
3. Access at: `http://your-server-ip:8080`

The application will automatically detect and display the Docker containers running on the server where it's deployed.

## Troubleshooting

If you encounter issues:

1. Ensure Docker socket is accessible: `ls -la /var/run/docker.sock`
2. Check container logs: `docker-compose logs`
3. Verify Docker permissions for the user running the containers
4. Make sure port 8080 is not already in use on your server

## Development

To run in development mode:

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Access at `http://localhost:5173`
