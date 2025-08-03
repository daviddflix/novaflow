# Chat

## MVP Scope
- Real-time chat per workspace (single channel for MVP)
- Send and receive messages instantly
- Show sender, message, and timestamp
- Basic @mention support (no autocomplete for MVP)

## User Stories
- As a user, I can send messages in my workspace chat.
- As a user, I can see all messages in the workspace chat.
- As a user, I can @mention other users to notify them.

## Flows
1. **Send Message:** User enters message → message sent to Supabase → broadcast via Realtime
2. **View Messages:** User sees live-updating chat feed
3. **@Mention:** User types @username → mention is parsed and notification sent

## Supabase Usage
- `ChatMessages` table for all messages
- `Mentions` table for @mentions
- Supabase Realtime for live updates

## UI/UX Notes
- Simple chat window in workspace
- Message input at bottom
- Show sender avatar, name, timestamp
- Highlight @mentions

## Edge Cases
- Message delivery failure (show error)
- Flood/spam prevention (out of scope for MVP)
- Editing/deleting messages (out of scope for MVP)

## Testing
- Send/receive messages via UI
- @mention triggers notification 

## API Contracts & Examples

All operations use the Supabase JS client. Tables: `ChatMessages`, `Mentions`.

### Send Message
**Request:**
```json
{
  "sender_id": "<user-uuid>",
  "message": "Hello team!",
  "channel_id": "<channel-uuid>",
  "workspace_id": "<workspace-uuid>"
}
```
**Supabase:**
```js
supabase.from('ChatMessages').insert([payload])
```

### Get Messages (by workspace/channel)
**Supabase:**
```js
supabase.from('ChatMessages').select('*').eq('workspace_id', '<workspace-uuid>')
// or
supabase.from('ChatMessages').select('*').eq('channel_id', '<channel-uuid>')
```

### Create Mention
**Request:**
```json
{
  "source_type": "chat",
  "source_id": "<message-uuid>",
  "mentioned_user_id": "<user-uuid>",
  "created_by": "<user-uuid>"
}
```
**Supabase:**
```js
supabase.from('Mentions').insert([payload])
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 