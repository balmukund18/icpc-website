# ICPC USICT Portal – Backend

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Express.js-5-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/Judge0-Integration-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Swagger-API_Docs-yellow?style=for-the-badge&logo=swagger" />
</p>

## 📘 Overview

A robust **Express.js + TypeScript** backend powering the ACM ICPC USICT Portal. This production-ready system includes:

- 🔐 **Google OAuth + JWT Authentication** with role-based access (Student, Admin, Alumni)
- 🏆 **Contest Management** with real-time code execution via Judge0
- 📝 **Task Assignment System** with LeetCode/Codeforces verification
- 🎮 **Gamification** with badges, leaderboards, and streaks
- 📚 **Blog System** with admin approval workflow
- 🤖 **AI Chatbot** powered by Groq (LLaMA 3)
- 🎓 **Alumni Network** with role-specific features
- 📊 **Comprehensive API Documentation** via Swagger UI

**Tech Stack:** Node.js, TypeScript, Express.js, PostgreSQL, Prisma ORM, Judge0, Groq AI, Passport.js

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#️-configuration)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Scripts Reference](#-scripts-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Core Features

- **Google OAuth** – Sign in with Google via Passport.js with admin approval workflow
- **JWT Authentication** – Secure token-based auth with role management (Student, Admin, Alumni)
- **Contest System** – Create contests, add problems, submit solutions
- **Task Management** – Assign DSA tasks with automatic link verification
- **Judge0 Integration** – Execute code in 50+ languages with real-time results
- **Profile Management** – User profiles with coding platform handles

### 🧩 Advanced Features

- **Gamification System**
  - Badges and achievements
  - Monthly/semester leaderboards
  - Streak tracking
- **Blog Platform** – User-submitted blogs with admin approval
- **Session Management** – Workshop registration and attendance tracking
- **Alumni Network** – Dedicated portal for alumni engagement
- **AI Assistant** – Groq-powered coding help (LLaMA 3)

### ⚙️ Technical Highlights

- ✅ **Prisma ORM** with PostgreSQL
- 📊 **Pino Structured Logging**
- ⏰ **Cron Jobs** for leaderboard updates & Judge0 polling
- 📖 **Swagger UI** interactive API documentation
- 🐳 **Docker** support with multi-stage builds
- 🧪 **80%+ test coverage** with Jest & Supertest
- 🔒 **Security** – Helmet, CORS, rate limiting
- 🚀 **CI/CD** with GitHub Actions

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js 18+, TypeScript 5.x |
| **Framework** | Express.js, Helmet, CORS, Rate Limiting |
| **Database** | PostgreSQL 15+, Prisma ORM |
| **Authentication** | Google OAuth (Passport.js), JWT, bcrypt |
| **Testing** | Jest, Supertest, ts-jest |
| **External APIs** | Judge0 CE, Groq AI (LLaMA 3) |
| **DevOps** | Docker, GitHub Actions |
| **Documentation** | Swagger UI |

---

## 📦 Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 15 or higher
- **npm** or **pnpm**
- **Git**
- **Docker** (optional, for containerized deployment)

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/icpc-website.git
cd icpc-website/backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/icpc_portal"
JWT_SECRET="your-32-char-secret-key-here"
PORT=5000
NODE_ENV=development

# Optional
JUDGE0_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_KEY="your-rapidapi-key"
GROQ_API_KEY="gsk_xxxx"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

> **⚠️ Security Note:** `JWT_SECRET` must be at least 32 characters. Weak secrets are rejected at startup.

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with admin user
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@icpc.local`
- Password: `admin1234`

### 4. Start Development Server
```bash
npm run dev
```

🎉 Server running at `http://localhost:5000`

**Test endpoints:**
- Health: `http://localhost:5000/api/health`
- Swagger UI: `http://localhost:5000/api/docs/ui`

---

## 📁 Project Structure
```
backend/
├── src/
│   ├── config/              # Environment & configuration
│   │   └── env.ts
│   ├── controllers/         # HTTP request handlers
│   │   ├── authController.ts
│   │   ├── contestController.ts
│   │   ├── judgeController.ts
│   │   └── ...
│   ├── routes/              # Express route definitions
│   │   ├── authRoutes.ts
│   │   ├── contestRoutes.ts
│   │   └── ...
│   ├── services/            # Business logic layer
│   │   ├── authService.ts
│   │   ├── contestJudgeService.ts
│   │   ├── judgeService.ts
│   │   └── ...
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── sanitize.ts
│   ├── models/              # Database models
│   │   └── prismaClient.ts
│   ├── jobs/                # Cron jobs
│   │   └── cron.ts
│   ├── utils/               # Utility functions
│   │   ├── logger.ts
│   │   ├── errorHandler.ts
│   │   ├── response.ts
│   │   ├── verifier.ts
│   │   └── badges.json
│   ├── tests/               # Test files
│   │   ├── unit/
│   │   └── integration/
│   ├── index.ts             # App entry point
│   └── testApp.ts           # Test server setup
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── docs/
│   └── DEMO.md              # Demo usage examples
├── scripts/
│   ├── demoSubmission.ts
│   └── integration-run.ps1
├── .github/workflows/       # CI/CD pipelines
├── Dockerfile               # Production Docker image
├── docker-compose.yml       # Local development
├── swagger.json             # API specification
├── API_DOCUMENTATION.md     # Detailed API docs
├── STRUCTURE.md             # Project structure guide
└── package.json
```

**Quick Links:**
- [Source Code](./src)
- [Prisma Schema](./prisma/schema.prisma)
- [API Documentation](./API_DOCUMENTATION.md)
- [Project Structure](./STRUCTURE.md)

---

## ⚙️ Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/icpc_portal"

# Authentication (minimum 32 characters)
JWT_SECRET="your-secure-random-32-char-secret"

# Server
PORT=5000
NODE_ENV=development
```

### Optional Environment Variables
```env
# Judge0 Integration
JUDGE0_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_KEY="your-rapidapi-key"
JUDGE0_KEY_HEADER="X-RapidAPI-Key"
JUDGE0_TIMEOUT_MS=15000

# Groq AI Integration
GROQ_API_KEY="gsk_xxxx"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Logging
LOG_LEVEL="info"          # debug, info, warn, error
LOG_TO_FILE="false"       # Enable file logging
LOG_HOSTNAME="myserver"   # Custom hostname in logs
```

### Security Considerations

- ✅ JWT secret validated at startup (min 32 chars)
- ✅ Weak/common secrets rejected
- ✅ Rate limiting enabled (200 req/15min)
- ✅ Helmet security headers
- ✅ CORS configured
- ✅ Input sanitization

---

## 📖 API Documentation

### Interactive Documentation

**Swagger UI:** [http://localhost:5000/api/docs/ui](http://localhost:5000/api/docs/ui)

### Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | ❌ | Health check |
| `/api/auth/register` | POST | ❌ | Register user |
| `/api/auth/login` | POST | ❌ | Login |
| `/api/auth/approve/:id` | POST | ✅ Admin | Approve user |
| `/api/profile` | GET/POST | ✅ User | Profile management |
| `/api/tasks` | POST | ✅ Admin | Create task |
| `/api/tasks/:id/submit` | POST | ✅ User | Submit task |
| `/api/contests` | GET/POST | ✅ | Contest management |
| `/api/contests/:id/submit` | POST | ✅ User | Submit solution |
| `/api/judge/submit` | POST | ✅ User | Execute code |
| `/api/gamification/leaderboard` | GET | ❌ | View leaderboard |
| `/api/sessions` | GET/POST | ✅ | Session management |
| `/api/blogs` | POST | ✅ User | Create blog |
| `/api/ai/chat` | POST | ✅ User | AI assistance |

**Full API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Example Request
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepass123",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepass123"
  }'

# Use the token in subsequent requests
curl http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 💻 Development

### Available Scripts
```bash
# Development
npm run dev              # Start with hot reload

# Build & Production
npm run build            # Compile TypeScript
npm start                # Run production build

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run seed             # Seed database

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests

# Utilities
npm run demo             # Demo Judge0 submission
```

### Database Management
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Code Quality
```bash
# Run tests with coverage
npm run test -- --coverage

# Type checking
npx tsc --noEmit

# Linting (if configured)
npm run lint
```

---

## 🧪 Testing

### Test Structure
```
tests/
├── unit/                    # Fast, isolated tests
│   ├── authRoutes.unit.test.ts
│   ├── authService.unit.test.ts
│   ├── contestJudge.unit.test.ts
│   └── health.unit.test.ts
└── integration/             # DB-dependent tests
    ├── auth.int.test.ts
    └── judge0.e2e.test.ts  # Requires Judge0 setup
```

### Running Tests
```bash
# All tests
npm test

# Unit tests (fast, no DB required)
npm run test:unit

# Integration tests (requires test DB)
npm run test:integration

# Judge0 integration (optional)
npm run test:integration:judge0
```

### Test Environment Setup

Create `.env.test`:
```bash
cp .env.test.example .env.test
```

Edit `.env.test`:
```env
DATABASE_URL_TEST="postgresql://USER:PASSWORD@localhost:5432/icpc_portal_test"
JWT_SECRET="test-secret-key-min-32-chars"
NODE_ENV=test
```

Run migrations for test DB:
```bash
DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
```

### Coverage

Current coverage: **80%+**
```bash
npm test -- --coverage
```

---

## 🚢 Deployment

### Docker Deployment

#### Quick Start
```bash
# Build image
docker build -t icpc-backend .

# Run container
docker run -p 5000:5000 --env-file .env icpc-backend
```

#### Docker Compose
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ chars)
- [ ] Configure production database URL
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Enable HTTPS (reverse proxy)
- [ ] Set up monitoring & logging
- [ ] Configure rate limits
- [ ] Enable CORS for your domain
- [ ] Set up backups

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret-min-32-chars"
PORT=5000

# Optional
JUDGE0_URL="https://..."
JUDGE0_KEY="..."
GROQ_API_KEY="gsk-..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
LOG_LEVEL="warn"
LOG_TO_FILE="true"
```

### CI/CD

GitHub Actions workflows:
- [CI Pipeline](./.github/workflows/ci.yml) – Tests on push/PR
- [Docker Build](./.github/workflows/image-publish.yml) – Publish images

---

## 📝 Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| **Development** |
| `dev` | `npm run dev` | Start dev server with hot reload |
| **Build** |
| `build` | `npm run build` | Compile TypeScript to `/dist` |
| `start` | `npm start` | Run production build |
| **Database** |
| `prisma:generate` | `npm run prisma:generate` | Generate Prisma client |
| `prisma:migrate` | `npm run prisma:migrate` | Create & apply migration |
| `seed` | `npm run seed` | Seed database with admin |
| **Testing** |
| `test` | `npm test` | Run all tests |
| `test:unit` | `npm run test:unit` | Unit tests only |
| `test:integration` | `npm run test:integration` | Integration tests |
| **Utilities** |
| `demo` | `npm run demo` | Demo Judge0 submission |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/icpc-website.git
cd icpc-website/backend
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Write clean, typed code
- Add tests for new features
- Update documentation
- Follow existing code style

### 4. Run Tests
```bash
npm run test:unit
npm run test:integration
```

### 5. Commit & Push
```bash
git add .
git commit -m "feat: add amazing feature"
git push origin feature/your-feature-name
```

### 6. Open Pull Request

- Describe your changes
- Link related issues
- Ensure CI passes

### Coding Standards

- ✅ TypeScript strict mode
- ✅ No `any` unless justified
- ✅ Service layer for business logic
- ✅ Pino for structured logging
- ✅ 80%+ test coverage
- ✅ Meaningful commit messages

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 📞 Support & Contact

- 📘 **Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- 📐 **Structure Guide:** [STRUCTURE.md](./STRUCTURE.md)
- 🐞 **Issues:** [GitHub Issues](https://github.com/yourusername/icpc-website/issues)
- 📧 **Email:** support@icpc-usict.edu

---

## 🎯 Key Features at a Glance

| Feature | Status | Details |
|---------|--------|---------|
| Authentication | ✅ | JWT with role-based access |
| Contests | ✅ | Full CRUD with Judge0 |
| Tasks | ✅ | LeetCode/CF verification |
| Gamification | ✅ | Badges, leaderboards, streaks |
| Blogs | ✅ | User posts with approval |
| Sessions | ✅ | Workshop management |
| Alumni | ✅ | Dedicated network |
| Google OAuth | ✅ | Passport.js integration |
| AI Chatbot | ✅ | Groq AI (LLaMA 3) |
| API Docs | ✅ | Swagger UI |
| Tests | ✅ | 80%+ coverage |
| Docker | ✅ | Production-ready |
| CI/CD | ✅ | GitHub Actions |

---

## 🚀 Next Steps

1. **Clone the repository**
2. **Set up environment** (`.env`)
3. **Run migrations & seed**
4. **Start development server**
5. **Explore Swagger UI**
6. **Read full [API Documentation](./API_DOCUMENTATION.md)**

---

<p align="center">
  Made with ❤️ for GGSIPU ACM ICPC by GGSIPU ACM DevSource
</p>

<p align="center">
  <a href="#icpc-usict-portal--backend">Back to Top ↑</a>
</p>