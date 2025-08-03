# Workspaces & Membership

## MVP Scope
- Create, view, and switch between workspaces
- Invite users to workspace (assign role)
- List workspace members and roles
- Remove user from workspace (admin only)
- Edit workspace name
- Change member roles (admin only)

## User Stories
- As an admin, I can create a new workspace.
- As an admin, I can invite users to my workspace and assign roles.
- As a user, I can switch between workspaces I belong to.
- As a user, I can see all members of my workspace and their roles.
- As an admin, I can change member roles and edit workspace name.

## Flows
1. **Create Workspace:** Admin enters name → workspace created → admin added as member
2. **Invite Member:** Admin enters email/role → invite sent → user added on acceptance
3. **Switch Workspace:** User selects workspace from switcher
4. **Remove Member:** Admin removes user → membership deleted (cannot remove last admin)
5. **Edit Workspace Name:** Admin edits name → saved to Supabase
6. **Change Role:** Admin changes member role

## Supabase Usage
- `Workspaces` table for workspace info
- `WorkspaceMembers` table for membership/roles
- Supabase Auth for user invites

## UI/UX Notes
- Workspace switcher in sidebar/header
- Member list with roles
- Invite form (email, role)
- Remove button for admins
- Edit workspace name field
- Role dropdown for admins

## Edge Cases
- Duplicate workspace name: Allowed
- User invited to same workspace twice: Supabase handles deduplication
- Removing last admin: Prevented in UI and backend
- Workspace deletion: Not available in MVP
- Member limit: No enforced limit for MVP

## FAQ
- **Can a user have different roles in different workspaces?** Yes
- **Can workspace names be changed?** Yes
- **Can workspaces be deleted?** No, not in MVP
- **Can roles be changed after invite?** Yes, by admin

## Testing
- Workspace CRUD via UI
- Member invite/remove via UI
- Edit name and roles 

## API Contracts & Examples

All operations use the Supabase JS client. Tables: `Workspaces`, `WorkspaceMembers`.

### Create Workspace
**Request:**
```json
{
  "name": "Design Team"
}
```
**Supabase:**
```js
supabase.from('Workspaces').insert([payload])
```

### Get Workspaces (for user)
**Supabase:**
```js
supabase.from('Workspaces').select('*').in('id', [<workspace-ids>])
```

### Update Workspace Name
**Request:**
```json
{
  "name": "New Name"
}
```
**Supabase:**
```js
supabase.from('Workspaces').update(payload).eq('id', '<workspace-uuid>')
```

### Invite Member
**Request:**
```json
{
  "workspace_id": "<workspace-uuid>",
  "user_id": "<user-uuid>",
  "role": "member"
}
```
**Supabase:**
```js
supabase.from('WorkspaceMembers').insert([payload])
```

### Remove Member
**Supabase:**
```js
supabase.from('WorkspaceMembers').delete().eq('workspace_id', '<workspace-uuid>').eq('user_id', '<user-uuid>')
```

### Change Member Role
**Request:**
```json
{
  "role": "admin"
}
```
**Supabase:**
```js
supabase.from('WorkspaceMembers').update({ role: 'admin' }).eq('workspace_id', '<workspace-uuid>').eq('user_id', '<user-uuid>')
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 