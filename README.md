# JWT Chat DevOps Project

This repository is packaged as a DevOps-ready full stack project for a CV or portfolio.

## Live Demo

Production app: https://mango-chat-green.vercel.app/

Demo accounts:

- Username: `user1`
	- Password: `123123`
- Username: `user2`
	- Password: `123456`

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

## How to test CI on a feature branch

Use this flow when you want to verify CI before merging into `develop`:

1. Create a feature branch from `develop`.
2. Make your change on the feature branch.
3. Commit and push the branch to GitHub.
4. Open a pull request from `feature/...` into `develop`.
5. Wait for GitHub Actions to finish.
6. Fix any CI failure on the same feature branch and push again.
7. Merge only when the PR is green.

## Branch flow

Use this branch strategy:

1. Create feature branches from `develop`.
2. Open a pull request from `feature/...` into `develop`.
3. Merge only after CI passes.
4. When `develop` is stable, open a pull request from `develop` into `master`.
5. Merge to `master` only after CI passes again.
6. CD/deploy runs only on `master`.
