# Design Patterns

## Folder Structure
- **Feature-based:** Each major feature (auth, chat, tasks, etc.) has its own folder under `src/features`.
- **Reusable Components:** Shared UI components in `src/components`.
- **Hooks:** Custom React hooks in `src/hooks`.
- **Services:** Supabase and other API wrappers in `src/services`.
- **Lib:** Utilities, permission logic, constants in `src/lib`.
- **Context:** Global providers (auth, notifications) in `src/context`.

## UI Component Library

NovaFlow uses [Mantine](https://mantine.dev/) for all UI components. Mantine provides a modern, accessible, and customizable set of React components with full TypeScript support and seamless Vite integration.

- Use Mantine components for all new UI unless there is a strong reason not to.
- Theming and dark mode are supported out of the box.
- See the [Mantine documentation](https://mantine.dev/docs/getting-started/) for usage examples and best practices.

If a required component is missing from Mantine, prefer building it as a reusable component in `src/components`.

## Component Patterns
- **Functional Components** with hooks.
- **Centralized Permission Layer** in `lib/permissions.ts`.
- **Notification Context** for toasts and in-app alerts.
- **Service Abstraction** for Supabase operations (`services/supabase.ts`).
- **Clean Separation** between feature logic and DB access.

## State Management
NovaFlow uses Zustand for global state management and React Query for data fetching, caching, and synchronization with Supabase.

### Zustand
- Used for global app state (user, workspace, notifications, UI state).
- Simple, unopinionated, and scalable.
- Example use cases: current user, selected workspace, notification queue.

### React Query
- Handles all data fetching, caching, and background updates from Supabase.
- Provides hooks for queries and mutations.
- Handles loading, error, and refetch states automatically.
- Example use cases: fetching projects, tasks, chat messages.

### Best Practices
- Use Zustand for state that is not persisted to the backend (UI, session, etc.).
- Use React Query for all server data (Supabase tables).
- Keep state logic close to features (feature-based stores/hooks).

## React Context
NovaFlow uses React Context for global providers such as authentication and notifications.

### Notification Context
- Provides a `notify()` function to trigger toast or panel notifications from anywhere in the app.
- Stores notification state (read/unread, queue).

### Auth Context
- Stores current user, workspace, and role information.
- Handles login, logout, and invite flows.

### Best Practices
- Use context for truly global state only (auth, notifications).
- Keep context providers close to the root of the app.
- Avoid putting large or frequently changing data in context (use Zustand or React Query instead).

#### Example Usage
```tsx
import { useNotification } from 'context/NotificationContext';

function MyComponent() {
  const { notify } = useNotification();
  // ...
}
```

## Linting & Formatting
- Use ESLint and Prettier for consistent code style.
- Enforce via pre-commit hooks.

## Error Handling
- Log errors to console for debugging.
- Use toast notifications for user-facing errors.
- Catch and handle all async errors in services/hooks.

### Unified Error Handling Strategy
- All user-facing errors are shown as toast notifications using the Notification Context.
- All errors are logged to the console for debugging.
- All async errors in services/hooks must be caught and surfaced to the user.
- No silent failures: every error should be visible to the user or developer.

## Accessibility (a11y)
- Basic ARIA attributes for interactive components.
- Full a11y coverage is out of scope for MVP.

## Testing
- Manual testing only for MVP (see [`testing.md`](./testing.md)).

## References
- [React Patterns](https://react.dev/learn/common-patterns)
- [Feature-based Structure](https://react.dev/learn/structuring-applications)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Context](https://react.dev/reference/react/createContext) 