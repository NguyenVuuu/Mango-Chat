# JWT Chat DevOps Project

This repository is packaged as a DevOps-ready real-time chat application for CV and portfolio use.

## Stack

- Frontend: React, Vite, TypeScript, Vercel
- Backend: Express, Socket.IO, MongoDB, Render
- Database: MongoDB Atlas
- CI/CD: GitHub Actions
- Local runtime: Docker Compose

## Delivery flow

1. Push to `master`.
2. GitHub Actions runs CI: backend build, frontend lint/build, Docker image build.
3. GitHub Actions deploys frontend to Vercel.
4. GitHub Actions triggers Render backend deploy hook.
5. GitHub Actions waits for `GET /api/health` to return `200`.

## Required secrets

Set these in GitHub repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `FRONTEND_VITE_API_URL`
- `FRONTEND_VITE_SOCKET_URL`
- `RENDER_DEPLOY_HOOK_URL`
- `BACKEND_BASE_URL`

## Local development

```bash
docker compose up --build
```

Frontend runs at `http://localhost:8080`.

## Notes

- Frontend builds should point to the deployed backend URL through `FRONTEND_VITE_API_URL` and `FRONTEND_VITE_SOCKET_URL`.
- Backend exposes a health endpoint at `/api/health` for deploy verification.
- Docker Compose is for local development; production deploys use Vercel and Render.

## Suggested CV bullets

- Built a Dockerized real-time chat application with MongoDB, Express, React, and Socket.IO.
- Implemented GitHub Actions CI/CD with build validation and cloud deployment.
- Deployed frontend on Vercel and backend on Render with health checks.
- Containerized local development with Docker Compose and reverse proxy routing.
