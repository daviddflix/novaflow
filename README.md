# NovaFlow – Internal Collaboration Platform

NovaFlow is an internal communication and project management platform designed for startups, aiming to replace Slack and Monday.com for teams of up to 50 users. It features workspace-based organization, real-time chat, Kanban-style project/task management, and robust role-based access control, all powered by Supabase and a modern React frontend.

## Key Features
- Workspace-based structure for scalability
- Role-based access (Admin, Member, Viewer)
- Real-time chat and notifications
- Project and task management (Kanban)
- Task dependencies and @mentions
- In-app notifications and activity tracking
- Full-text search (initial support)
- Invite-only registration (no public sign-up)

## Architecture
- **Frontend:** Vite + React + TypeScript
- **Backend:** Supabase (Auth, Postgres, Storage, Realtime)
- **State Management:** Zustand, React Query
- **Styling:** TailwindCSS

## Documentation
All technical and process documentation is in the `/docs` directory:

- [Architecture](docs/architecture.md)
- [Frontend Guidelines](docs/frontend-guidelines.md)
- [Code Quality](docs/code-quality.md)
- [Supabase Schema](docs/supabase-schema.md)
- [RLS Policies](docs/rls-policies.md)
- [State Management](docs/state-management.md)
- [Permissions](docs/permissions.md)
- [Notifications](docs/notifications.md)
- [Testing](docs/testing.md)
- [Local Development](docs/local-dev.md)
- [Roadmap](docs/roadmap.md)
- [Environment & Config](docs/environment.md)

## MVP Scope
- No production deployment for MVP
- Minimum security (Supabase Auth, RLS)
- Manual testing only (via Postman)
- Invite-only registration (users are invited by admins)

---

For detailed implementation, see the documentation in `/docs`. 