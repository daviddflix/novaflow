# Users

## MVP Scope
- User profile (name, email, avatar)
- Global fallback role (for future use)
- View/edit own profile
- Avatar upload (optional for MVP, max 2MB, jpg/png only)

## User Stories
- As a user, I can view my profile information.
- As a user, I can update my name and avatar.
- As an admin, I can view user info for workspace members.

## Flows
1. **Profile View:** User navigates to profile/settings page
2. **Profile Edit:** User updates name/avatar → changes saved to Supabase
3. **Avatar Upload:** User uploads image (jpg/png, max 2MB) → stored in Supabase Storage

## Supabase Usage
- `Users` table for profile info
- Supabase Storage for avatars
- Profile updates via Supabase client

## UI/UX Notes
- Simple profile page
- Avatar upload with preview
- Editable name field

## Edge Cases
- Invalid avatar file type/size: Show error
- Duplicate email: Should not occur (enforced by Supabase)
- User not found: Should not occur
- User removed from all workspaces: User can still log in but sees no data

## FAQ
- **Can users change their email?** Not in MVP
- **Is avatar upload required?** No, it's optional
- **Can users delete their account?** Not in MVP
- **Can admins edit user profiles?** No, only view

## Testing
- Profile view/edit via UI
- Avatar upload via UI 

## API Contracts & Examples

All operations use the Supabase JS client. Table: `Users` and Supabase Storage for avatars.

### Get User Profile
**Supabase:**
```js
supabase.from('Users').select('*').eq('id', '<user-uuid>').single()
```

### Update User Profile
**Request:**
```json
{
  "name": "Jane Doe"
}
```
**Supabase:**
```js
supabase.from('Users').update(payload).eq('id', '<user-uuid>')
```

### Upload Avatar
**Supabase:**
```js
supabase.storage.from('avatars').upload('<user-uuid>.jpg', file)
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 