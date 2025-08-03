# Codex Prompt Engineering Guide

This document standardizes how to use Codex (or similar LLMs) to accelerate feature and infrastructure development. For each feature, use the provided prompt templates and supply relevant context (types, schema, example data) for best results.

---

## How to Use
1. For each new feature or task, copy the relevant prompt and add any context (TypeScript types, schema, etc.).
2. Paste the prompt and context into Codex, Copilot, or ChatGPT.
3. Review and refine the output. Update the prompt in this doc if improvements are found.

---

## Tasks

### UI Prompt
```
Generate a Mantine-based React component for a task card with:
- Title
- Assignee (user avatar and name)
- Status (Todo, In Progress, Done)
- Due date
Include edit and delete buttons, and use Mantine theming.
```
_Context:_ TypeScript type for Task, example Mantine Button usage.

### API Prompt
```
Write a Supabase JS query to fetch all tasks for a given project and workspace.
```
_Context:_ Tasks table schema.

### RLS Policy Prompt
```
Write a Supabase RLS policy for the Tasks table so only the assignee or an admin can update a task.
```
_Context:_ Tasks and WorkspaceMembers schema, role definitions.

---

## Projects

### UI Prompt
```
Generate a Mantine-based React component for a project card with title, owner, and status. Include edit/delete buttons for admins.
```

### API Prompt
```
Write a Supabase JS query to list all projects in a workspace.
```

### RLS Policy Prompt
```
Write a Supabase RLS policy so only workspace members can read projects, and only admins/members can modify.
```

---

## Workspaces

### UI Prompt
```
Generate a Mantine-based React component for a workspace switcher and member list, showing roles and invite/remove buttons for admins.
```

### API Prompt
```
Write a Supabase JS query to invite a user to a workspace and assign a role.
```

### RLS Policy Prompt
```
Write a Supabase RLS policy so only workspace admins can invite or remove members.
```

---

## Users

### UI Prompt
```
Generate a Mantine-based React profile page with editable name and avatar upload (jpg/png, max 2MB).
```

### API Prompt
```
Write a Supabase JS query to update a user's profile name and avatar.
```

---

## Auth

### UI Prompt
```
Generate a Mantine-based login form for email/password authentication using Supabase Auth.
```

### API Prompt
```
Write a Supabase JS query to invite a user by email and handle registration via magic link.
```

---

## Infrastructure Example

### CI/CD Prompt
```
Create a GitHub Actions workflow to build and deploy a Vite + React + TypeScript app to Vercel. Use pnpm for install/build.
```
_Context:_ Project uses pnpm, required environment variables for build.

---

## Best Practices
- Be specific and clear about the goal.
- Provide relevant code, types, or config as context.
- Use step-by-step instructions for complex tasks.
- Use triple backticks for code blocks.
- Iterate and refine prompts as needed. 