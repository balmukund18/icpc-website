# ICPC Portal – Frontend

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/shadcn/ui-Components-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Framer_Motion-Animations-purple?style=for-the-badge" />
</p>

## 📘 Overview

A modern **Next.js 16 (App Router)** frontend for the ACM ICPC USICT portal. Built with React 19, Tailwind CSS 4, and shadcn/ui for a premium, responsive user experience with full dark/light mode support.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Google OAuth** | Sign in with Google, with admin approval workflow |
| 🏆 **Contest Arena** | Real-time coding contests with CodeMirror editor |
| ✅ **Task Management** | DSA task assignments with submission tracking |
| 📝 **Blog System** | Rich-text blog posts with Tiptap editor and admin approval |
| 📅 **Sessions** | Workshop scheduling and registration |
| 📢 **Announcements** | Pinned announcements feed |
| 🎓 **Alumni Network** | Browse and connect with alumni profiles |
| 🤖 **AI Chatbot** | Groq-powered coding assistant (authenticated only) |
| 🌗 **Dark/Light Mode** | Full theme toggle with system preference support |
| 📱 **Responsive Design** | Mobile-friendly dashboard with collapsible sidebar |
| 👤 **Profile Management** | User profiles with CP platform handles |
| 🎯 **Gamification** | Points, leaderboards, and badges |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework (App Router) |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui + Radix | Accessible UI components |
| Zustand | Global state management |
| SWR | Data fetching & caching |
| Framer Motion | Animations & transitions |
| CodeMirror | Code editor for contests |
| Tiptap | Rich-text blog editor |
| Axios | HTTP client |
| Zod | Schema validation |
| next-themes | Dark/light mode |
| react-markdown | Markdown rendering |
| Sonner | Toast notifications |

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── admin/                 # Admin dashboard (user mgmt, contests, sessions)
│   ├── alumni/                # Alumni network browser
│   ├── announcements/         # Announcements feed
│   ├── auth/
│   │   ├── callback/          # Google OAuth callback
│   │   └── pending-approval/  # Pending approval page
│   ├── blog/
│   │   ├── [id]/              # Blog post view
│   │   ├── edit/[id]/         # Edit blog post
│   │   ├── my/                # My blog posts
│   │   └── write/             # Write new blog post
│   ├── contests/
│   │   ├── [id]/              # Contest arena
│   │   └── page.tsx           # Contest listing
│   ├── dashboard/             # Main dashboard
│   ├── login/                 # Login page (Google Sign-In)
│   ├── profile/               # Profile settings
│   ├── register/              # Registration page
│   ├── sessions/
│   │   ├── [id]/              # Session details
│   │   └── page.tsx           # Session listing
│   ├── tasks/
│   │   ├── [id]/              # Task details
│   │   └── page.tsx           # Task listing
│   ├── layout.tsx             # Root layout with theme provider
│   ├── page.tsx               # Landing page
│   └── globals.css            # CSS variables & theme definitions
├── components/
│   ├── ui/                    # shadcn/ui components (button, card, dialog, etc.)
│   ├── app-sidebar.tsx        # Dashboard sidebar with navigation
│   ├── chat-widget.tsx        # AI chatbot widget
│   ├── dashboard-layout.tsx   # Responsive dashboard layout
│   ├── GoogleSignInButton.tsx # Google OAuth button
│   ├── mode-toggle.tsx        # Dark/light mode toggle
│   ├── rich-text-editor.tsx   # Tiptap rich-text editor
│   └── theme-provider.tsx     # next-themes provider
├── lib/
│   ├── hooks/                 # Custom React hooks
│   ├── adminService.ts        # Admin API calls
│   ├── alumniService.ts       # Alumni API calls
│   ├── axios.ts               # Axios instance config
│   ├── blogService.ts         # Blog API calls
│   ├── chatService.ts         # AI chat API calls
│   ├── contestService.ts      # Contest API calls
│   ├── profileService.ts      # Profile API calls
│   ├── sessionService.ts      # Session API calls
│   ├── swr-config.tsx         # SWR configuration
│   ├── taskService.ts         # Task API calls
│   └── utils.ts               # Utility functions
├── store/
│   ├── useAuthStore.ts        # Auth state (Zustand)
│   ├── useSessionStore.ts     # Session state
│   └── useTaskStore.ts        # Task state
├── .env.local                 # Environment variables
├── package.json
└── tsconfig.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- Backend server running at `http://localhost:5000`

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Next.js dev server (hot reload) |
| `build` | `npm run build` | Create optimized production build |
| `start` | `npm start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |

---

## 🎨 Theming

The app supports **dark and light modes** via `next-themes`. Theme variables are defined in `globals.css` using CSS custom properties:

- **Light mode**: Clean white backgrounds with subtle borders
- **Dark mode**: Rich dark backgrounds with purple/indigo accents

Toggle between modes using the 🌙/☀️ button in the sidebar.

### Theme-Aware Classes

| Class | Usage |
|-------|-------|
| `bg-background` | Page backgrounds |
| `bg-card` | Card/container backgrounds |
| `bg-muted` | Subtle secondary backgrounds |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary/subtle text |
| `border-border` | Borders |
| `bg-sidebar` | Sidebar background |

---

## 🔗 Backend Connection

The frontend connects to the backend API at the URL specified in `NEXT_PUBLIC_API_URL` (default: `http://localhost:5000/api`).

Ensure the backend is running before using the frontend. See the [backend README](../backend/README.md) for setup instructions.

---

## 📱 Pages Overview

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| Landing | `/` | ❌ | Animated landing page |
| Login | `/login` | ❌ | Google Sign-In + register link |
| Register | `/register` | ❌ | Registration form |
| Pending Approval | `/auth/pending-approval` | ❌ | Awaiting admin approval |
| Dashboard | `/dashboard` | ✅ | Main user dashboard |
| Profile | `/profile` | ✅ | Edit profile & CP handles |
| Contests | `/contests` | ✅ | Browse & join contests |
| Contest Arena | `/contests/[id]` | ✅ | Code editor & submissions |
| Tasks | `/tasks` | ✅ | Browse & submit tasks |
| Sessions | `/sessions` | ✅ | View & register for sessions |
| Blog | `/blog` | ✅ | Browse blog posts |
| Write Blog | `/blog/write` | ✅ | Rich-text blog editor |
| Announcements | `/announcements` | ✅ | Announcements feed |
| Alumni | `/alumni` | ✅ | Alumni network |
| Admin | `/admin` | ✅ Admin | Full admin dashboard |

---

<p align="center">
  Made with ❤️ for GGSIPU ACM ICPC by GGSIPU ACM DevSource
</p>
