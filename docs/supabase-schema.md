# Supabase Schema

## Overview
This document describes the database schema for NovaFlow, implemented in Supabase Postgres. All tables use Row-Level Security (RLS) and are designed for workspace-based, role-based access.

## Users
- `id` (UUID, PK)
- `email` (TEXT, unique)
- `name` (TEXT)
- `avatar_url` (TEXT)
- `role` (TEXT, global fallback role)

## Workspaces
- `id` (UUID, PK)
- `name` (TEXT)
- `created_by` (UUID, FK → users.id)
- `created_at` (TIMESTAMP)

## WorkspaceMembers
- `workspace_id` (UUID, FK → workspaces.id)
- `user_id` (UUID, FK → users.id)
- `role` (admin/member/viewer)
- PRIMARY KEY (`workspace_id`, `user_id`)

## Projects
- `id` (UUID, PK)
- `title` (TEXT)
- `description` (TEXT)
- `owner_id` (UUID, FK → users.id)
- `status` (TEXT)
- `created_at` (TIMESTAMP)
- `workspace_id` (UUID, FK → workspaces.id)

## Tasks
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects.id)
- `title` (TEXT)
- `status` (TEXT)
- `priority` (TEXT)
- `due_date` (DATE)
- `assignee_id` (UUID, FK → users.id)
- `tags` (TEXT[])
- `created_by` (UUID, FK → users.id)
- `updated_at` (TIMESTAMP)
- `workspace_id` (UUID, FK → workspaces.id)

## TaskDependencies
- `task_id` (UUID, FK → tasks.id)
- `depends_on_task_id` (UUID, FK → tasks.id)
- `type` (blocks, relates_to)

## Comments
- `id` (UUID, PK)
- `task_id` (UUID, FK → tasks.id, nullable)
- `project_id` (UUID, FK → projects.id, nullable)
- `user_id` (UUID, FK → users.id)
- `content` (TEXT)
- `timestamp` (TIMESTAMP)

## ChatMessages
- `id` (UUID, PK)
- `sender_id` (UUID, FK → users.id)
- `message` (TEXT)
- `channel_id` (UUID)
- `timestamp` (TIMESTAMP)
- `workspace_id` (UUID, FK → workspaces.id)

## Mentions
- `id` (UUID, PK)
- `source_type` (task/comment/chat)
- `source_id` (UUID)
- `mentioned_user_id` (UUID, FK → users.id)
- `created_by` (UUID, FK → users.id)
- `created_at` (TIMESTAMP)

## Notifications
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `type` (TEXT)
- `message` (TEXT)
- `read` (BOOLEAN)
- `created_at` (TIMESTAMP)

## ActivityLog
- `id` (UUID, PK)
- `actor_id` (UUID, FK → users.id)
- `action` (TEXT)
- `entity_type` (TEXT)
- `entity_id` (UUID)
- `metadata` (JSONB)
- `timestamp` (TIMESTAMP)

## FileUploads
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `file_url` (TEXT)
- `type` (TEXT)
- `created_at` (TIMESTAMP)
- `workspace_id` (UUID, FK → workspaces.id)

## SearchIndex
- `id` (UUID, PK)
- `type` (task, project, message)
- `content` (TEXT)
- `entity_id` (UUID)

## Relationships
- Users can belong to multiple workspaces via WorkspaceMembers.
- Projects and tasks are always scoped to a workspace.
- Comments can be attached to tasks or projects.
- Chat messages are scoped to workspace channels.

## Invite-Only Registration
- Users are created via admin invite (no public sign-up).
- Invited users receive an email with a registration link (Supabase Auth magic link or password setup).

## References
- [Supabase Schema Design](https://supabase.com/docs/guides/database)
- [Supabase Auth Invite Flow](https://supabase.com/docs/guides/auth/auth-invite-users) 