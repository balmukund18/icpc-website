# ICPC Website

Full-stack web application for ICPC with React frontend and Express backend.

## Project Structure

```
ICPC-website/
├── frontend/          # React + TypeScript + Vite
└── backend/           # Express + TypeScript
```

## Getting Started

### Frontend

Navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

### Backend

Navigate to the backend directory:
```bash
cd backend
npm install
npm run dev
```

The backend API will run on `http://localhost:5000`.

## Development

Both frontend and backend can be run simultaneously during development.

### Frontend Stack
- React 18
- TypeScript
- Vite
- ESLint

### Backend Stack
- Express
- TypeScript
- CORS
- dotenv

## Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
