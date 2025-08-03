# Tasks & Dependencies

## MVP Scope
- Create, view, update, and delete tasks (CRUD)
- Tasks scoped to a project and workspace
- Assign task to user (single assignee)
- Set status (Todo, In Progress, Done), priority, due date
- Task dependencies (blocks/relates to)
- Tagging (optional for MVP)
- Edit/remove dependencies

## User Stories
- As a user, I can create tasks in a project.
- As a user, I can assign tasks to myself or others.
- As a user, I can set status, priority, and due date for tasks.
- As a user, I can link tasks as dependencies (blocks/relates to).
- As a user, I can edit or remove dependencies.

## Flows
1. **Create Task:** User enters title/details → task created
2. **Assign Task:** User selects assignee (one per task)
3. **Set Status/Priority:** User updates fields (statuses: Todo, In Progress, Done)
4. **Add/Edit/Remove Dependency:** User links/unlinks tasks (blocks/relates to); circular dependencies are prevented
5. **View Tasks:** User sees Kanban/list view by status

## Supabase Usage
- `Tasks` table for task info
- `TaskDependencies` table for dependencies

## UI/UX Notes
- Kanban board or list view
- Task card with assignee, status, due date
- Dependency indicator
- Edit/delete buttons (if permitted)

## Edge Cases
- Circular dependencies: Prevented in UI and backend
- Deleting task with dependents: Warn and prevent deletion
- Assigning to non-member: Prevent in UI
- Task moving between projects: Not available in MVP
- Multiple assignees: Not available in MVP
- Archiving: Not available in MVP

## FAQ
- **Can tasks be moved between projects?** No
- **Can tasks have multiple assignees?** No
- **How are circular dependencies prevented?** Checked before linking
- **Can dependencies be edited after creation?** Yes
- **What statuses are available?** Todo, In Progress, Done
- **Can tasks be archived?** No, not in MVP

## Testing
- Task CRUD via UI
- Dependency linking/unlinking 

## API Contracts & Examples

All operations use the Supabase JS client. Table: `Tasks` and `TaskDependencies`.

### Create Task
**Request:**
```json
{
  "title": "Design login page",
  "project_id": "<project-uuid>",
  "workspace_id": "<workspace-uuid>",
  "assignee_id": "<user-uuid>",
  "status": "Todo",
  "priority": "High",
  "due_date": "2024-07-01"
}
```
**Supabase:**
```js
supabase.from('Tasks').insert([payload])
```

### Get Tasks (by project)
**Supabase:**
```js
supabase.from('Tasks').select('*').eq('project_id', '<project-uuid>')
```

### Update Task
**Request:**
```json
{
  "title": "New title",
  "status": "In Progress"
}
```
**Supabase:**
```js
supabase.from('Tasks').update(payload).eq('id', '<task-uuid>')
```

### Delete Task
**Supabase:**
```js
supabase.from('Tasks').delete().eq('id', '<task-uuid>')
```

### Add Dependency
**Request:**
```json
{
  "task_id": "<task-uuid>",
  "depends_on_task_id": "<other-task-uuid>",
  "type": "blocks"
}
```
**Supabase:**
```js
supabase.from('TaskDependencies').insert([payload])
```

### Remove Dependency
**Supabase:**
```js
supabase.from('TaskDependencies').delete().eq('task_id', '<task-uuid>').eq('depends_on_task_id', '<other-task-uuid>')
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 