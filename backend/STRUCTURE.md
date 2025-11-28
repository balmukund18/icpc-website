erver.js`

# Backend Folder Structure

This document provides a clear, navigable view of the `backend/` workspace. Use it to quickly find entry points, scripts, and important folders.

Table of contents

1. [Top-level files](#top-level-files)
2. [Scripts & CI](#scripts--ci)
3. [Configuration & database](#configuration--database)
4. [Source code (`src/`)](#source-code-src)
5. [Tests](#tests)
6. [Quick commands](#quick-commands)

---

## Top-level files

```
backend/
├─ .env*                    # local env (ignored)
├─ .env.example
├─ .env.test.example
├─ .gitignore
├─ Dockerfile
├─ docker-compose.yml
├─ docker-compose.prod.yml
├─ package.json
├─ package-lock.json
├─ README.md
├─ tsconfig.json
├─ jest.config.cjs
├─ swagger.json
└─ STRUCTURE.md             # this file
```

## Scripts & CI

```
scripts/
├─ integration-run.ps1      # local integration helper (PowerShell)
├─ demoSubmission.ts        # demo script to submit/poll Judge0

.github/workflows/
├─ ci.yml                   # migrations + tests + optional Judge0 E2E
└─ image-publish.yml        # build/publish Docker image when secrets set
```

## Configuration & database

```
prisma/
├─ schema.prisma
└─ migrations/               # timestamped migration folders

migrations/                 # alternative migration output location
seed.ts                     # seed sample/admin data
```

## Source code (`src/`)

Top-level structure:

```
src/
├─ index.ts                 # app entrypoint
├─ testApp.ts               # test server wrapper
├─ controllers/
├─ routes/
├─ services/
├─ models/
├─ middleware/
├─ jobs/
└─ utils/
```

Controllers (HTTP handlers):

```
src/controllers/
├─ authController.ts
├─ profileController.ts
├─ taskController.ts
├─ contestController.ts
├─ judgeController.ts
├─ aiController.ts
├─ blogController.ts
├─ announcementController.ts
├─ sessionController.ts
├─ alumniController.ts
└─ gamificationController.ts
```

Routes (routing):

```
src/routes/
├─ authRoutes.ts
├─ profileRoutes.ts
├─ taskRoutes.ts
├─ contestRoutes.ts
├─ judgeRoutes.ts
├─ aiRoutes.ts
├─ blogRoutes.ts
├─ announcementRoutes.ts
├─ sessionRoutes.ts
├─ alumniRoutes.ts
└─ gamificationRoutes.ts
```

Services (business logic):

```
src/services/
├─ authService.ts
├─ profileService.ts
├─ taskService.ts
├─ contestService.ts
├─ contestJudgeService.ts
├─ judgeService.ts
├─ aiService.ts
├─ blogService.ts
├─ announcementService.ts
├─ sessionService.ts
├─ alumniService.ts
└─ gamificationService.ts
```

Models, middleware, jobs and utils:

```
src/models/prismaClient.ts
src/middleware/auth.ts
src/jobs/cron.ts
src/utils/logger.ts
src/utils/errorHandler.ts
src/utils/response.ts
src/utils/verifier.ts
src/utils/badges.json
```

## Tests

```
tests/
├─ unit/
│  ├─ authRoutes.unit.test.ts
│  ├─ authService.unit.test.ts
│  ├─ contestJudge.unit.test.ts
│  ├─ contestRoutes.unit.test.ts
│  └─ health.unit.test.ts
├─ integration/
│  ├─ auth.int.test.ts
│  └─ judge0.e2e.test.ts   # runs only when JUDGE0_URL is set
└─ other tests (ai, verifier, etc.)
```

## Quick commands

Run unit tests (fast):

```powershell
cd backend
npm run test:unit
```

Run integration locally (Docker required):

```powershell
cd backend
npm run integration:local
```

Generate Prisma client & run migrations:

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

---

If you want a `tree`-style text file or a JSON export of this structure, tell me which format and I will add `STRUCTURE-tree.txt` or `STRUCTURE.json` to the `backend/` folder.
