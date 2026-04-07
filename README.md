# Todo Frontend

A Todo application frontend built with Next.js, React, Tailwind CSS, and Material UI. It includes authentication routes, task management, and a dashboard layout.

## Features

- Login and signup pages
- Dashboard with todo list management
- Drawer-based navigation component
- API utilities for auth and todos
- React Query for remote state management
- Axios for HTTP requests
- Toast notifications for user feedback

## Tech Stack

- Next.js
- React 19
- TypeScript
- Tailwind CSS v4
- Material UI
- React Query
- Axios
- React Toastify

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - start the local development server
- `npm run build` - build the production app
- `npm run start` - start the production server after build
- `npm run lint` - run ESLint

## Project Structure

- `app/` - Next.js App Router source files
  - `app/page.tsx` - landing or dashboard entry point
  - `app/layout.tsx` - application shell and global layout
  - `app/providers.tsx` - global providers and context wrappers
  - `app/auth/login/page.tsx` - login page
  - `app/auth/signup/page.tsx` - signup page
  - `app/dashboard/page.tsx` - dashboard view
  - `app/components/drawer.tsx` - navigation drawer component
  - `app/lib/api.ts` - Axios request helper
  - `app/lib/auth.ts` - authentication utilities
  - `app/lib/todos.ts` - todo API helpers
- `public/` - static assets
- `globals.css` - global styling

## Notes

This repo is intended as the frontend portion of a todo application and assumes a backend API is available for authentication and todo data.

If you want to customize the look and feel, update `globals.css`, `app/components/drawer.tsx`, or the Material UI component styles.
