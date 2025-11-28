# Backend — ICPC Website

Clean, developer-focused documentation for the Express + TypeScript backend powering the ICPC Website.

This backend provides user authentication, contest and task management, Prisma + PostgreSQL persistence, cron-based background jobs (including Judge0 poller), and optional OpenAI integration for an AI chatbot.

**Quick links:**

- **Source:** `./src`
- **Prisma schema:** `./prisma/schema.prisma`
- **Env example:** `./.env.example`

## Features

- JWT authentication with role-based access
- Contests, tasks, profile management
- Background cron jobs (leaderboards, Judge0 polling)
- Judge0 integration for code execution (configurable)
- Prisma ORM with migrations and seed scripts
- Unit & integration test scaffolding (Jest + supertest)

## Tech stack

- Node.js, TypeScript, Express
- PostgreSQL + Prisma
- Jest + ts-jest + supertest
- GitHub Actions for CI

## Requirements

- Node.js (recommended v18+)
- npm or pnpm
- Docker & Docker Compose (optional for local DB)

## Environment variables

Copy `.env.example` to `.env` and update the values. Important variables:

- `DATABASE_URL` : Postgres connection string used by Prisma
- `JWT_SECRET` : Secret for signing JWTs
- `PORT` : Server port (default `5000`)
- `OPENAI_API_KEY` : Optional, for AI chatbot
- `JUDGE0_URL` : Optional, Judge0 base URL (e.g. `https://judge0.example.com`)
- `JUDGE0_KEY` : Optional, Judge0 API key
- `JUDGE0_KEY_HEADER` : Optional, header name for Judge0 key (default `X-Auth-Token`)

See `.env.example` for the full list.

## Quickstart — Local (PowerShell)

1. Install dependencies

```powershell
cd backend
npm install
```

2. Generate Prisma client and run migrations

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

3. Seed sample data (optional)

```powershell
npm run seed
```

4. Run in development

```powershell
npm run dev
```

The API will be available at `http://localhost:<PORT>` (default `5000`).

## Useful scripts

- `npm run dev` : Start dev server with ts-node / nodemon
- `npm run build` : Compile to `dist/`
- `npm start` : Run compiled server from `dist/`
- `npm run seed` : Run database seed script
- `npm test` : Run unit & integration tests (conditional on env)
- `npm run test:unit` : Run unit tests only
- `npm run test:integration` : Run integration tests (requires DB)

## Prisma & database

- Generate client: `npx prisma generate`
- Create/migrate schema: `npx prisma migrate dev --name my_migration`
- Open Studio: `npx prisma studio`

If you prefer Docker for Postgres, use the included `docker-compose.yml` (or run the commands in `docs/DEMO.md`).

## Docker

Build and run a production image (example):

```powershell
docker build -t icpc-backend:local .
docker run -p 5000:5000 --env-file .env icpc-backend:local
```

Or use `docker-compose up` for an app + Postgres combination.

## CI

GitHub Actions are configured to run migrations, seed the DB, build the app, and run tests. See `.github/workflows/ci.yml` for details.

## Judge0 (code execution)

This project integrates with Judge0 for executing code submissions. Configure these env vars when using Judge0:

- `JUDGE0_URL` : Base URL of the Judge0 API
- `JUDGE0_KEY` : API key (if required)
- `JUDGE0_KEY_HEADER` : Header name for the key (defaults to `X-Auth-Token`)
- `JUDGE0_TIMEOUT_MS` : Optional HTTP timeout (ms) for Judge0 requests

The backend normalizes Judge0 responses and includes a poller to update submission statuses.

Judge0 integration test notes:

- The optional Judge0 integration test `src/tests/integration/judge0.e2e.test.ts` will only run when a Judge0 endpoint is configured. The test will be skipped if `JUDGE0_URL` or `JUDGE0_KEY` are not set, or if `SKIP_JUDGE0=true`.
- If your local Judge0 instance or proxy requires no external auth but your routes require authentication, set `SKIP_AUTH=true` when running integration tests so the test app can call `/api/judge` without a token.

PowerShell examples:

```powershell
# Run integration tests with SKIP_AUTH so judge routes don't require a JWT
$env:SKIP_AUTH = 'true'; npm run test:integration

# Run only the Judge0 integration test with Judge0 env configured
$env:JUDGE0_URL = 'https://judge0.example.com'; $env:JUDGE0_KEY = 'your-key'; npm run test:integration:judge0
```

## Testing

Unit tests mock Prisma and external services so they run without a DB. Integration tests expect a configured test database (`.env.test`).

Run unit tests:

```powershell
npm run test:unit
```

Run integration tests (ensure `DATABASE_URL_TEST` is set and migrations applied):

```powershell
npm run test:integration
```

## Contributing

If you'd like to contribute:

1. Fork the repo and create a feature branch
2. Run tests and linters
3. Open a PR describing the change and include relevant tests

## Useful commands (PowerShell)

```powershell
# install deps
cd "c:\Users\utkyd\Documents\WEB DEVELOPMENT\ICPC-website\backend"; npm install
# prisma + migrations
npx prisma generate; npx prisma migrate dev --name init
# seed + start
npm run seed; npm run dev
```
