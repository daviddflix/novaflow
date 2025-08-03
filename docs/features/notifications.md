# Notifications

## MVP Scope
- In-app toast notifications for key events (mentions, task assignment, etc.)
- Notification panel with read/unread state
- Notifications triggered by @mentions, task updates, chat

## User Stories
- As a user, I receive a toast notification when I am mentioned or assigned a task.
- As a user, I can view all my notifications in a panel.
- As a user, I can mark notifications as read.

## Flows
1. **Trigger Notification:** Event occurs (mention, assignment) → notification created in Supabase
2. **Toast Notification:** Shown immediately in UI
3. **Notification Panel:** User opens panel to view all notifications
4. **Mark as Read:** User marks notification as read

## Supabase Usage
- `Notifications` table for all notifications
- Supabase Realtime for live updates

## UI/UX Notes
- Toasts for immediate feedback
- Panel accessible from header/sidebar
- Unread indicator

## Edge Cases
- Duplicate notifications (deduplicate in UI)
- Notification for deleted entity (handle gracefully)

## Testing
- Trigger notifications via UI actions
- Mark as read in panel 

## API Contracts & Examples

All operations use the Supabase JS client. Table: `Notifications`.

### Create Notification
**Request:**
```json
{
  "user_id": "<user-uuid>",
  "type": "mention",
  "message": "You were mentioned in a comment.",
  "read": false
}
```
**Supabase:**
```js
supabase.from('Notifications').insert([payload])
```

### Get Notifications (for user)
**Supabase:**
```js
supabase.from('Notifications').select('*').eq('user_id', '<user-uuid>')
```

### Mark as Read
**Supabase:**
```js
supabase.from('Notifications').update({ read: true }).eq('id', '<notification-uuid>')
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 