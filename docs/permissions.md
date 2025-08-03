# Permissions & RBAC

## Overview
NovaFlow uses role-based access control (RBAC) at both the application and database (Supabase) levels. Roles are scoped to workspaces and determine what actions a user can perform.

## Roles
- **Admin:** Full access to all workspace features, can invite/remove members, manage projects/tasks.
- **Member:** Can create and update projects/tasks, participate in chat, but cannot manage workspace settings or members.
- **Viewer:** Read-only access to workspace data.

## Workspace Membership
- Users can belong to multiple workspaces, each with a distinct role.
- Membership is tracked in the `WorkspaceMembers` table.

## Enforcement
- **Frontend:** Centralized permission utilities in `lib/permissions.ts` check user role and workspace membership before rendering actions/components.
- **Backend (Supabase):** RLS policies enforce permissions at the data level (see `docs/rls-policies.md`).

## Best Practices
- Always check permissions before showing UI actions (edit, delete, invite).
- Never trust frontend checks alone—enforce all permissions in Supabase RLS.

## Example (Frontend)
```ts
// lib/permissions.ts
export function canEditProject(user, workspace) {
  return user.role === 'admin' || user.role === 'member';
}
```

## References
- [Supabase RBAC](https://supabase.com/docs/guides/auth/row-level-security) 