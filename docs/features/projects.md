# Projects

## MVP Scope
- Create, view, update, and delete projects (CRUD)
- Projects scoped to a workspace
- Assign project owner
- List all projects in workspace
- Edit project owner (admin only)

## User Stories
- As a user, I can create a new project in my workspace.
- As a user, I can view all projects in my workspace.
- As a user, I can update or delete projects I own (or if admin).
- As an admin, I can change the project owner.

## Flows
1. **Create Project:** User enters title/description (max 500 chars) → project created
2. **View Projects:** User sees list of projects in workspace
3. **Edit Project:** User updates title/description/owner
4. **Delete Project:** User deletes project (admin/owner only); all tasks are deleted (cascade)

## Supabase Usage
- `Projects` table for project info
- Owner is a user in the workspace

## UI/UX Notes
- Project list/grid view
- Project card with title, owner, status
- Edit/delete buttons (if permitted)
- Owner dropdown for admins

## Edge Cases
- Deleting project with tasks: All tasks deleted (cascade)
- Duplicate project titles: Allowed
- Owner leaves workspace: Admin must reassign owner before removal
- Project moving between workspaces: Not available in MVP
- Archiving: Not available in MVP

## FAQ
- **Can projects be moved between workspaces?** No
- **Can project owners be changed?** Yes, by admin
- **What happens to tasks if a project is deleted?** All tasks are deleted (cascade)
- **Can projects be archived?** No, not in MVP
- **Is there a project description length limit?** 500 characters

## Testing
- Project CRUD via UI
- Owner change 

## API Contracts & Examples

All operations use the Supabase JS client. Table: `Projects`.

### Create Project
**Request:**
```json
{
  "title": "Website Redesign",
  "description": "Update the company website.",
  "workspace_id": "<workspace-uuid>",
  "owner_id": "<user-uuid>"
}
```
**Supabase:**
```js
supabase.from('Projects').insert([payload])
```

### Get Projects (by workspace)
**Supabase:**
```js
supabase.from('Projects').select('*').eq('workspace_id', '<workspace-uuid>')
```

### Update Project
**Request:**
```json
{
  "title": "New title",
  "description": "Updated description"
}
```
**Supabase:**
```js
supabase.from('Projects').update(payload).eq('id', '<project-uuid>')
```

### Delete Project
**Supabase:**
```js
supabase.from('Projects').delete().eq('id', '<project-uuid>')
```

### Change Owner (admin only)
**Request:**
```json
{
  "owner_id": "<new-user-uuid>"
}
```
**Supabase:**
```js
supabase.from('Projects').update({ owner_id: '<new-user-uuid>' }).eq('id', '<project-uuid>')
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 