#!/bin/bash

echo "Building Docker Port Manager..."

# Stop any existing containers
docker-compose down

# Build and start the services
docker-compose up --build -d

echo "Application started!"
echo "Frontend: http://localhost:8080"
echo "Backend API: http://localhost:3001"
echo "Health check: http://localhost:3001/api/health"

# Show logs
echo "Showing logs..."
docker-compose logs -f
