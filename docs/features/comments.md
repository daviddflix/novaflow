# Comments

## MVP Scope
- Add, view, and delete comments on tasks and projects
- Comments linked to either a task or a project
- Show author and timestamp

## User Stories
- As a user, I can add comments to tasks and projects I have access to.
- As a user, I can view all comments on a task or project.
- As a user, I can delete my own comments.
- As an admin, I can delete any comment in my workspace.

## Flows
1. **Add Comment:** User enters comment → comment saved to Supabase
2. **View Comments:** User sees list of comments (chronological)
3. **Delete Comment:** User deletes own (or admin deletes any) comment

## Supabase Usage
- `Comments` table for all comments
- Link to `task_id` or `project_id` (one nullable)

## UI/UX Notes
- Comment list below task/project details
- Input box for new comment
- Delete button (if permitted)
- Show author avatar and timestamp

## Edge Cases
- Deleting comment with replies (if threaded, out of scope for MVP)
- Editing comments (out of scope for MVP)
- Commenting on deleted task/project (prevent)

## Testing
- Add/view/delete comments via UI 

## API Contracts & Examples

All operations use the Supabase JS client. Table: `Comments`.

### Add Comment
**Request:**
```json
{
  "user_id": "<user-uuid>",
  "content": "Looks good!",
  "task_id": "<task-uuid>"
}
```
**Supabase:**
```js
supabase.from('Comments').insert([payload])
```

### Get Comments (for task/project)
**Supabase:**
```js
supabase.from('Comments').select('*').eq('task_id', '<task-uuid>')
// or
supabase.from('Comments').select('*').eq('project_id', '<project-uuid>')
```

### Delete Comment
**Supabase:**
```js
supabase.from('Comments').delete().eq('id', '<comment-uuid>')
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 