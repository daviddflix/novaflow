# Testing

## Overview
For the MVP, all testing is manual. Automated tests are out of scope.

## Manual Testing
- Use Postman to test API endpoints (Supabase REST).
- Use Supabase Studio to inspect and modify data directly.
- Test all user flows: invite, login, workspace switching, project/task CRUD, chat, notifications.

## Manual Test Plan for Critical Flows

### Auth
- [ ] Invite user by email, complete registration
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (see error)
- [ ] Password reset flow
- [ ] Logout

### Permissions
- [ ] Admin can invite/remove members
- [ ] Member cannot remove other members
- [ ] Viewer cannot edit data

### Workspace CRUD
- [ ] Create workspace
- [ ] Edit workspace name
- [ ] Switch between workspaces
- [ ] Invite/remove member

### Project CRUD
- [ ] Create project
- [ ] Edit project
- [ ] Delete project (cascade tasks)
- [ ] Change project owner

### Task CRUD & Dependencies
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Assign task
- [ ] Add/remove dependency
- [ ] Prevent circular dependency

### File Uploads
- [ ] Upload file to task/project
- [ ] Download/view file
- [ ] Upload avatar

### Chat
- [ ] Send message
- [ ] Receive message in real time
- [ ] @mention triggers notification

### Notifications
- [ ] Receive notification for mention/assignment
- [ ] Mark notification as read

### Comments
- [ ] Add comment to task/project
- [ ] View comments
- [ ] Delete own comment
- [ ] Admin deletes any comment

## Checklist
- [ ] User invite and registration
- [ ] Login/logout
- [ ] Workspace CRUD
- [ ] Project/task CRUD
- [ ] Task dependencies
- [ ] Chat and notifications
- [ ] File uploads

## References
- [Supabase Studio](https://supabase.com/docs/guides/database/supabase-studio)
- [Postman](https://www.postman.com/) 