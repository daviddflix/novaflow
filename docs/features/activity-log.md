# Activity Log

## MVP Scope
- Log key actions (project/task creation, updates, comments, etc.)
- View activity log per workspace
- Show actor, action, entity, timestamp

## User Stories
- As a user, I can view a log of recent activity in my workspace.
- As an admin, I can audit actions taken by members.

## Flows
1. **Log Action:** User performs action → entry created in `ActivityLog`
2. **View Log:** User opens activity log panel/page

## Supabase Usage
- `ActivityLog` table for all actions
- Supabase Realtime for live updates (optional for MVP)

## UI/UX Notes
- List view with actor, action, entity, time
- Filter by action/entity (optional for MVP)

## Edge Cases
- Log entry for deleted entity (show as deleted)
- Large log (paginate or limit for MVP)

## Testing
- Actions create log entries
- Log view updates as expected 

## API Contracts & Examples

All operations use the Supabase JS client. Table: `ActivityLog`.

### Create Log Entry
**Request:**
```json
{
  "actor_id": "<user-uuid>",
  "action": "created_task",
  "entity_type": "task",
  "entity_id": "<task-uuid>",
  "metadata": { "title": "Design login page" }
}
```
**Supabase:**
```js
supabase.from('ActivityLog').insert([payload])
```

### Get Activity Log (by workspace)
**Supabase:**
```js
supabase.from('ActivityLog').select('*').eq('workspace_id', '<workspace-uuid>')
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 