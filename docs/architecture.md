# Architecture

## Overview
NovaFlow is a fully frontend-powered platform using Vite, React, and TypeScript, integrated directly with Supabase for authentication, database, storage, and real-time features. The architecture is designed for scalability, security, and rapid development.

## Stack
- **Frontend:** Vite + React + TypeScript
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime)
- **State Management:** Zustand, React Query
- **Styling:** Dedicated css modules

## Client ↔ Supabase Architecture
- **Auth:** Supabase Auth (invite-only, email/password)
- **DB:** Supabase Postgres (row-level security for RBAC and workspace-based access)
- **Realtime:** Supabase Realtime (chat, task updates, mentions)
- **Storage:** Supabase Storage (files, avatars)

## Data Flow
1. **User Authenticates** via invite-only email/password (Supabase Auth).
2. **Frontend** interacts directly with Supabase via the Supabase JS SDK.
3. **Data Fetching** uses React Query for caching and Zustand for global state.
4. **Realtime Updates** are handled via Supabase Realtime subscriptions.
5. **File Uploads** go directly to Supabase Storage.

## Security
- All tables use Row-Level Security (RLS) with policies for workspace and role-based access.
- Custom JWT claims for user role and workspace membership.

## Scalability
- Workspace-based organization allows for easy scaling to multiple teams.
- Feature-based folder structure for maintainable codebase.

## Project Structure

NovaFlow uses a feature-based folder structure for scalability and maintainability. The recommended structure is:

```
/src
  /assets           # Static assets (images, fonts, etc.)
  /components       # Reusable UI components (Button, Modal, etc.)
  /features
    /auth
    /chat
    /comments
    /notifications
    /projects
    /search
    /tasks
    /users
    /workspaces
    /file-uploads
    /activity-log
  /context          # React context providers (AuthContext, NotificationContext, etc.)
  /hooks            # Custom React hooks
  /lib              # Utilities, constants, permission logic
  /services         # API/Supabase wrappers
  /styles           # Global styles, CSS modules, theme config
  /pages            # Top-level route components (if using file-based routing)
  /types            # TypeScript types/interfaces
  /App.tsx
  /main.tsx
  /index.html
```

- Each feature folder contains its own components, hooks, and logic.
- `components/` is for shared, generic UI elements.
- `context/` and `hooks/` are for global state and custom hooks.
- `services/` abstracts Supabase and other APIs.
- `lib/` is for utilities and permission logic.
- `styles/` for global and theme styles.

## UI Component Library

NovaFlow uses [Mantine](https://mantine.dev/) as the primary UI component library for rapid, modern, and accessible UI development. Mantine was chosen for:
- Full TypeScript support and easy Vite integration
- All components are free and open source
- Excellent theming and dark mode support
- Rich set of components (forms, tables, modals, notifications, etc.)
- Simple customization and extension

Alternatives considered: MUI (Material UI), shadcn/ui. Mantine was selected for its balance of ease-of-use, modern design, and flexibility for internal tools and dashboards.

## References
- [Supabase Architecture Docs](https://supabase.com/docs/guides/architecture)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Storage](https://supabase.com/docs/guides/storage) 