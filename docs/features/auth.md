# Auth (Authentication)

## MVP Scope
- Invite-only registration (no public sign-up)
- Email/password login via Supabase Auth
- Session management (auto-login, logout)
- Password reset via email

## User Stories
- As an admin, I can invite a user by email, triggering an invite email.
- As an invited user, I can set my password and log in.
- As a user, I can log in and out securely.
- As a user, I can reset my password if forgotten.

## Flows
1. **Invite:** Admin enters email → Supabase sends invite (magic link or password setup)
   - If the invite link expires (default: 1 week, per Supabase), admin can resend the invite.
   - Admins cannot revoke invites for MVP.
2. **Registration:** User clicks invite link → sets password (min 6 chars, per Supabase default) → logs in
3. **Login:** User enters email/password → session is created (Supabase manages session expiration; no "remember me" for MVP)
4. **Logout:** User logs out → session cleared
5. **Password Reset:** User requests reset → receives email → sets new password

## Supabase Usage
- Use Supabase Auth (email/password)
- Use [invite user API](https://supabase.com/docs/guides/auth/auth-invite-users)
- Store user profile in `Users` table (on signup trigger)

## UI/UX Notes
- Simple login form
- Invite email with clear instructions
- Password reset form
- Show clear error messages for invalid login, expired/invalid invite, or password reset issues

## Edge Cases
- Expired or invalid invite link: Show error and allow admin to resend
- Duplicate invites: Supabase handles deduplication
- User tries to register without invite: Show error
- Password reset for non-existent email: Show generic error

## FAQ
- **What is the password policy?** Minimum 6 characters (Supabase default)
- **How long do invite links last?** 1 week (Supabase default)
- **Can admins see pending invites?** Not in MVP, but can be added later
- **How are sessions managed?** Supabase manages session expiration; no custom logic for MVP

## Testing
- Invite flow via Postman/Supabase Studio
- Login/logout via UI
- Password reset via email 

## API Contracts & Examples

All operations use the Supabase JS client. Uses Supabase Auth endpoints.

### Invite User
**Supabase:**
```js
supabase.auth.admin.inviteUserByEmail('<email>')
```

### Register (via invite link)
Handled by Supabase Auth magic link or password setup page.

### Login
**Request:**
```json
{
  "email": "user@email.com",
  "password": "password123"
}
```
**Supabase:**
```js
supabase.auth.signInWithPassword({ email, password })
```

### Logout
**Supabase:**
```js
supabase.auth.signOut()
```

### Password Reset
**Supabase:**
```js
supabase.auth.resetPasswordForEmail('<email>')
```

**Error Handling:** All errors are surfaced as toast notifications in the UI. See frontend-guidelines for details. 