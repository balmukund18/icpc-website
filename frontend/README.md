# ICPC Portal Frontend

This is the frontend for the ICPC Portal, built with Next.js, Zustand, and Shadcn UI.

## Getting Started

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Run the development server:

    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- **Authentication**: Login and Register with role selection.
- **Dashboard**: Protected route displaying user info.
- **UI Components**: Built with Shadcn UI.
- **State Management**: Zustand for auth state.

## Backend Connection

The frontend connects to the backend at `http://localhost:5000/api`.
Ensure the backend is running before using the frontend.
