# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **React 18 + Vite** — frontend framework and build tool
- **Tailwind CSS** — utility-first styling
- **Firebase** — Firestore (real-time database) + Auth (Google login)
- **Vercel** — deployment (free tier)

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

## Architecture

All user data lives at `users/{uid}/tasks/{taskId}` in Firestore with real-time listeners — no manual refresh needed.

**Data flow:** `useTasks` hook (`src/hooks/useTasks.js`) owns all Firestore reads/writes and is the single source of truth. Components call it and get `{ tasks, loading, addTask, updateTask, toggleTask, deleteTask }`.

**Views** (all in `src/components/`):
- `Today` — tasks due today + overdue + no-due-date buckets
- `TaskList` — all tasks with Active/All/Completed filter + category/priority selectors
- `Calendar` — monthly grid; click a day to see/add its tasks
- `AIExport` — formats tasks as copyable text for pasting into Claude/ChatGPT

**Shared components:**
- `TaskItem` — renders a single task row (checkbox, title, badges, edit/delete)
- `TaskForm` — modal for creating and editing tasks; accepts `defaultDate` prop to pre-fill due date

## Task schema (Firestore)

```
title: string
description: string
priority: 'High' | 'Medium' | 'Low'
category: 'Work' | 'Personal' | 'Health' | 'Other'
dueDate: string (YYYY-MM-DD) | ''
completed: boolean
createdAt: Timestamp
```

## Environment variables

Copy `.env.example` to `.env` and fill in Firebase project values. All vars are prefixed `VITE_FIREBASE_*`. On Vercel, add these as Environment Variables in the project dashboard.

## Firebase setup required

1. Create project at console.firebase.google.com
2. Enable Firestore and Authentication (Google provider)
3. Add Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
