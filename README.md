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
3. Run the application:

```bash
docker-compose up -d
```

4. Access the application at `http://your-server-ip:8080`

## Architecture

- **Frontend**: React + Tailwind CSS (served by Nginx)
- **Backend**: Node.js + Express API
- **Docker Integration**: Uses Docker socket to communicate with Docker daemon

## API Endpoints

- `GET /api/ports` - Get all used ports and container information
- `GET /api/ports/:port/check` - Check if a specific port is available
- `GET /api/ports/random` - Get a random available port

## Security Notes

- The backend container has read-only access to the Docker socket
- Only port information is exposed, no container control capabilities
- Runs on internal Docker network with minimal exposed ports

## Troubleshooting

If you encounter issues:

1. Ensure Docker socket is accessible: `ls -la /var/run/docker.sock`
2. Check container logs: `docker-compose logs`
3. Verify Docker permissions for the user running the containers

## Development

To run in development mode:

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Access at `http://localhost:5173`