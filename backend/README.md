ICPC USICT Portal - Backend
A comprehensive Express.js + TypeScript backend powering the ACM ICPC USICT portal. Features include user authentication, contest management, code execution via Judge0, gamification, and AI-powered assistance.
Show Image

📋 Table of Contents

Features
Tech Stack
Prerequisites
Quick Start
Project Structure
Configuration
API Documentation
Development
Testing
Deployment
Scripts Reference
Contributing


✨ Features
Core Functionality

JWT Authentication - Secure role-based access control (Student/Admin/Alumni)
Contest Management - Create contests, add problems, track submissions
Task System - Assign DSA problems, verify submissions from LeetCode/Codeforces
Judge0 Integration - Execute code in 50+ languages with automated testing
Profile Management - User profiles with coding handles and progress tracking

Advanced Features

Gamification - Points, badges, leaderboards (monthly/semester/all-time)
AI Chatbot - OpenAI-powered assistant for coding help
Blog System - User-submitted articles with admin approval workflow
Session Management - Workshops, attendance tracking, summaries
Alumni Network - Dedicated portal for alumni engagement

Technical Highlights

Background Jobs - Cron-based leaderboard updates and Judge0 polling
Structured Logging - Pino logger with optional file rotation
Comprehensive Testing - Unit and integration tests with >80% coverage
API Documentation - Interactive Swagger UI at /api/docs/ui
Docker Support - Multi-stage builds for production deployment


🛠 Tech Stack
CategoryTechnologiesRuntimeNode.js 18+, TypeScript 5.xFrameworkExpress.js with Helmet, CORS, Rate LimitingDatabasePostgreSQL 15+ with Prisma ORMAuthenticationJWT, bcryptTestingJest, Supertest, ts-jestExternal APIsJudge0 CE, OpenAI GPT-4DevOpsDocker, GitHub Actions CI/CD

📦 Prerequisites

Node.js 18.x or higher
npm or pnpm
PostgreSQL 15+ (or Docker)
Git


🚀 Quick Start
1. Clone and Install
bashgit clone https://github.com/yourusername/icpc-website.git
cd icpc-website/backend
npm install
2. Configure Environment
bashcp .env.example .env
Edit .env with your configuration (see Configuration):
envDATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/icpc_portal"
JWT_SECRET="your-super-secure-secret-min-32-chars"
PORT=5000
NODE_ENV=development
3. Database Setup
bash# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with admin user (admin@icpc.local / admin1234)
npm run seed
4. Start Development Server
bashnpm run dev
```

Server runs at `http://localhost:5000`. Check health: `http://localhost:5000/api/health`

---

## 📁 Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── env.ts                    # Environment validation
│   ├── controllers/                   # HTTP request handlers
│   │   ├── authController.ts
│   │   ├── contestController.ts
│   │   └── ... (10+ controllers)
│   ├── routes/                        # Express route definitions
│   │   ├── authRoutes.ts
│   │   ├── contestRoutes.ts
│   │   └── ... (route mappings)
│   ├── services/                      # Business logic layer
│   │   ├── authService.ts
│   │   ├── judgeService.ts
│   │   ├── contestJudgeService.ts
│   │   └── ... (service modules)
│   ├── middleware/
│   │   ├── auth.ts                   # JWT validation, role checks
│   │   ├── requestId.ts              # Request tracing
│   │   ├── sanitize.ts               # XSS protection
│   │   └── validate.ts               # Input validation
│   ├── models/
│   │   └── prismaClient.ts           # Prisma instance
│   ├── jobs/
│   │   └── cron.ts                   # Background jobs (polling, streaks)
│   ├── utils/
│   │   ├── logger.ts                 # Pino logger
│   │   ├── errorHandler.ts           # Centralized error handling
│   │   ├── response.ts               # Standard API responses
│   │   ├── verifier.ts               # LeetCode/CF link validation
│   │   └── badges.json               # Badge definitions
│   ├── tests/
│   │   ├── unit/                     # Unit tests (mocked dependencies)
│   │   └── integration/              # Integration tests (real DB)
│   ├── index.ts                      # App entry point
│   └── testApp.ts                    # Test server setup
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Migration history
├── scripts/
│   ├── demoSubmission.ts             # Judge0 demo script
│   └── integration-run.ps1           # Local integration helper
├── .github/workflows/
│   ├── ci.yml                        # CI pipeline
│   └── image-publish.yml             # Docker image publishing
├── docs/
│   └── DEMO.md                       # Usage examples
├── Dockerfile                         # Production container
├── docker-compose.yml                # Local development stack
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── jest.config.cjs                   # Jest test configuration
├── swagger.json                      # OpenAPI specification
├── API_DOCUMENTATION.md              # Complete API reference
├── STRUCTURE.md                      # Detailed folder structure
└── README.md                         # This file
Key Files:

API_DOCUMENTATION.md - Complete endpoint reference with examples
STRUCTURE.md - Navigable codebase overview
schema.prisma - Database models
.env.example - Required environment variables


⚙️ Configuration
Essential Environment Variables
Create .env in the backend directory:
env# Database (Required)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/icpc_portal"

# Authentication (Required)
JWT_SECRET="min-32-character-secret-use-openssl-rand-base64-32"

# Server
PORT=5000
NODE_ENV=development

# Judge0 Integration (Optional)
JUDGE0_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_KEY="your-rapidapi-key"
JUDGE0_KEY_HEADER="X-RapidAPI-Key"

# OpenAI (Optional)
OPENAI_API_KEY="sk-..."

# Logging (Optional)
LOG_LEVEL="info"
LOG_TO_FILE="false"
LOG_HOSTNAME="icpc-backend"
Security Requirements
⚠️ Critical: The application validates environment variables at startup:

JWT_SECRET must be ≥32 characters
Weak secrets like dev_secret, password, changeme are rejected
Production deployments should use cryptographically secure random strings

Generate a secure secret:
bashopenssl rand -base64 32
Testing Configuration
For integration tests, create .env.test:
envDATABASE_URL_TEST="postgresql://USER:PASSWORD@localhost:5432/icpc_portal_test"
JWT_SECRET="test-secret-min-32-chars-long-for-security"
NODE_ENV=test

📖 API Documentation
Interactive Documentation
Visit http://localhost:5000/api/docs/ui for Swagger UI
Quick Reference
EndpointMethodAuthDescription/api/auth/registerPOSTNoneCreate account/api/auth/loginPOSTNoneGet JWT token/api/profilePOSTUserUpdate profile/api/tasksPOSTAdminCreate assignment/api/tasks/:id/submitPOSTUserSubmit solution/api/contestsPOSTAdminCreate contest/api/contests/:id/submitPOSTUserSubmit code/api/judge/submitPOSTUserExecute code/api/gamification/leaderboardGETNoneView rankings
Example: Complete Auth Flow
bash# 1. Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"securepass123"}'

# 2. Admin approves user (requires admin token)
curl -X POST http://localhost:5000/api/auth/approve/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"securepass123"}'
  
# Response: {"success":true,"data":{"token":"eyJhbGc...","user":{...}}}

# 4. Use token for authenticated requests
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","branch":"CSE","year":3}'
Full documentation: API_DOCUMENTATION.md
Postman collection: postman_collection.json

💻 Development
Available Scripts
bash# Development
npm run dev              # Start with auto-reload (ts-node-dev)

# Building
npm run build           # Compile TypeScript to dist/
npm start              # Run compiled code (production)

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Create migration
npm run seed           # Seed admin user (admin@icpc.local / admin1234)

# Testing
npm test               # Run all tests
npm run test:unit      # Unit tests only (fast, mocked)
npm run test:integration # Integration tests (requires DB)

# Utilities
npm run demo           # Run Judge0 demo script
Development Workflow

Create a feature branch

bash   git checkout -b feature/your-feature

Make changes and test

bash   npm run dev           # Start server
   npm run test:unit     # Run tests

Update database schema (if needed)

bash   # Edit prisma/schema.prisma
   npx prisma migrate dev --name your_migration
   npx prisma generate

Commit and push

bash   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature
Database Management
bash# View data in browser
npx prisma studio

# Reset database (DESTRUCTIVE)
npx prisma migrate reset

# Generate migration without applying
npx prisma migrate dev --create-only

# Apply pending migrations
npx prisma migrate deploy
Judge0 Integration
The backend supports any Judge0-compatible API. Configure in .env:
envJUDGE0_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_KEY="your-api-key"
JUDGE0_KEY_HEADER="X-RapidAPI-Key"  # or "X-Auth-Token" for self-hosted
Test with the demo script:
bashnpm run demo
```

**See:** [docs/DEMO.md](./docs/DEMO.md) for detailed usage

---

## 🧪 Testing

### Test Structure
```
tests/
├── unit/                 # Fast tests with mocked dependencies
│   ├── authRoutes.unit.test.ts
│   ├── authService.unit.test.ts
│   ├── contestJudge.unit.test.ts
│   └── health.unit.test.ts
└── integration/          # Real database tests
    ├── auth.int.test.ts
    └── judge0.e2e.test.ts  # Optional, requires Judge0
Running Tests
bash# All tests (unit + integration)
npm test

# Unit tests only (no database required)
npm run test:unit

# Integration tests (requires test database)
npm run test:integration

# With coverage report
npm test -- --coverage

# Watch mode during development
npm test -- --watch
Test Configuration
Integration tests use DATABASE_URL_TEST from .env.test. Ensure migrations are applied:
bashDATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
Judge0 E2E Tests
The optional Judge0 integration test requires:

JUDGE0_URL and JUDGE0_KEY configured
SKIP_JUDGE0 not set to true

To run:
bashJUDGE0_URL="..." JUDGE0_KEY="..." npm run test:integration:judge0
Note: Set SKIP_AUTH=true when testing Judge0 routes that normally require JWT authentication.

🚢 Deployment
Docker Deployment
Build Image
bashdocker build -t icpc-backend:latest .
Run Container
bashdocker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e PORT=5000 \
  icpc-backend:latest
Docker Compose (with PostgreSQL)
bash# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-Specific Considerations

#### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure production database URL
- [ ] Enable HTTPS/TLS at reverse proxy layer
- [ ] Set up log aggregation (`LOG_TO_FILE=true`)
- [ ] Configure rate limiting (default: 200 req/15min)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed admin user if needed

#### Recommended Architecture
```
[Load Balancer] → [Reverse Proxy (nginx)]
                       ↓
    [Backend Containers] ← [PostgreSQL]
           ↓
    [Redis Cache] (optional)
           ↓
    [Judge0 API]
CI/CD Pipeline
GitHub Actions automatically:

Runs tests on every push/PR (.github/workflows/ci.yml)
Builds Docker images on main branch (.github/workflows/image-publish.yml)
Requires secrets: CONTAINER_REGISTRY, CONTAINER_REGISTRY_TOKEN


📜 Scripts Reference
ScriptDescriptionUse Casenpm run devStart development server with hot-reloadLocal developmentnpm run buildCompile TypeScript to JavaScriptPre-deploymentnpm startRun compiled production serverProduction environmentsnpm run seedCreate admin user in databaseInitial setupnpm testRun all tests (unit + integration)CI/CD pipelinesnpm run test:unitRun unit tests onlyQuick validationnpm run test:integrationRun integration testsPre-deployment checksnpm run demoSubmit sample code to Judge0Judge0 setup verificationnpm run prisma:generateGenerate Prisma clientAfter schema changesnpm run prisma:migrateCreate and apply migrationDatabase schema updatesnpm run integration:localRun integration tests with DockerLocal testing setup

🤝 Contributing
We welcome contributions! Please follow these guidelines:
Reporting Issues

Check existing issues before creating new ones
Include error messages, logs, and reproduction steps
Tag with appropriate labels (bug/enhancement/question)

Pull Request Process

Fork and clone the repository
Create a feature branch: git checkout -b feature/amazing-feature
Make your changes following our coding standards
Write/update tests for your changes
Run tests: npm run test:unit
Update documentation if needed
Commit with clear messages: feat: add amazing feature
Push and create PR: Include description of changes

Coding Standards

TypeScript: Use strict mode, avoid any when possible
Naming: camelCase for variables/functions, PascalCase for classes
Error Handling: Use custom error classes from utils/customErrors.ts
Logging: Use structured logging via logger (not console.log)
Comments: Document complex logic and API integrations

Testing Requirements

Unit tests for business logic (services)
Integration tests for API endpoints
Maintain >80% code coverage
All tests must pass before merging


📄 License
This project is licensed under the ISC License.

🙏 Acknowledgments

Prisma - Next-generation ORM
Judge0 - Code execution engine
OpenAI - AI-powered assistance
ACM ICPC - Competitive programming community


📞 Support

Documentation: API_DOCUMENTATION.md
Issues: GitHub Issues
Email: support@icpc-usict.edu (replace with actual contact)


Built with ❤️ by the ACM ICPC USICT Team