# Search

## MVP Scope
- Full-text search across tasks, projects, and messages
- Search bar in UI
- Show results with type and snippet

## User Stories
- As a user, I can search for tasks, projects, or messages by keyword.
- As a user, I can see where a result comes from (type, project, etc.).

## Flows
1. **Enter Query:** User types in search bar
2. **Show Results:** Results fetched from Supabase and displayed with context

## Supabase Usage
- `SearchIndex` table for indexed content
- Use Supabase full-text search features

## UI/UX Notes
- Search bar in header/sidebar
- Results list with type, snippet, link to entity

## Edge Cases
- No results (show message)
- Stale index (manual reindex for MVP)

## Testing
- Search returns expected results
- Links navigate to correct entity 

## API Contracts & Examples

All operations use the Supabase JS client. Table: `SearchIndex`.

### Search Query
**Supabase:**
```js
supabase.from('SearchIndex').select('*').textSearch('content', '<query>')
```

### Update Index (manual for MVP)
**Supabase:**
```js
supabase.from('SearchIndex').insert([payload])
```

**Search Index Update Process:**
- The `SearchIndex` table must be updated manually after changes to tasks, projects, or messages.
- For MVP, run a script or use Supabase Studio to reindex as needed.

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 