# File Uploads

## MVP Scope
- Upload and attach files to tasks/projects
- Upload user avatars
- Store files in Supabase Storage
- List/download attachments

## User Stories
- As a user, I can upload files to tasks or projects.
- As a user, I can upload and update my avatar.
- As a user, I can download/view attachments.

## Flows
1. **Upload File:** User selects file → uploaded to Supabase Storage → URL saved in `FileUploads`
2. **List Attachments:** User sees list of files attached to task/project
3. **Download/View:** User clicks file to download/view

## Supabase Usage
- Supabase Storage for file data
- `FileUploads` table for metadata

## UI/UX Notes
- File picker for uploads
- Attachment list with download links
- Avatar upload with preview

## Edge Cases
- Invalid file type/size (validate client-side)
- Orphaned files (clean up in future)

## Testing
- Upload/download via UI
- Avatar upload 

## API Contracts & Examples

All operations use the Supabase JS client. Table: `FileUploads` and Supabase Storage.

### Upload File
**Supabase:**
```js
supabase.storage.from('attachments').upload('<file-path>', file)
```

### List Attachments (for task/project)
**Supabase:**
```js
supabase.from('FileUploads').select('*').eq('task_id', '<task-uuid>')
// or
supabase.from('FileUploads').select('*').eq('project_id', '<project-uuid>')
```

### Download/View File
**Supabase:**
```js
supabase.storage.from('attachments').download('<file-path>')
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 