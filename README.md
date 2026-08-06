# JWT Chat DevOps Project

This repository is packaged as a DevOps-ready full stack project for a CV or portfolio.

## Stack

- Backend: Node.js, Express, Socket.IO, MongoDB
- Frontend: React, Vite, TypeScript, Nginx
- Delivery: Docker, Docker Compose, GitHub Actions

## What is included

- Multi-stage Docker builds for backend and frontend
- Nginx reverse proxy for API and Socket.IO traffic
- Docker Compose stack with MongoDB
- CI workflow that installs, lint-checks, builds, and Docker-builds the project

## Run locally

1. Provide your Cloudinary credentials in the shell or a local `.env` file.
2. Start the full stack:

```bash
docker compose up --build
```

3. Open the app at `http://localhost:8080`.

## Deployment model

The frontend is served by Nginx and proxies these paths to the backend container:

- `/api` for REST endpoints
- `/socket.io` for real-time events

This keeps the browser-facing app on one origin and removes CORS friction in production.

## CI pipeline

The GitHub Actions workflow performs three checks:

1. Backend install and syntax/build validation
2. Frontend lint and production build
3. Docker image builds for both services
