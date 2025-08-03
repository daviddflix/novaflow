# Row-Level Security (RLS) Policies

## Overview
All tables in NovaFlow use Row-Level Security (RLS) to enforce workspace-based and role-based access. Policies are designed to ensure users can only access data for workspaces they belong to, and only as permitted by their role.

## General Principles
- RLS is enabled on all tables.
- Policies check for workspace membership and user role.
- Admins have full access within their workspace.
- Members have limited write access.
- Viewers have read-only access.

## Example: WorkspaceMembers Table
```sql
-- Only allow users to see their own workspace memberships
CREATE POLICY "WorkspaceMembers: Select own memberships" ON "WorkspaceMembers"
  FOR SELECT USING (auth.uid() = user_id);
```

## Example: Projects Table
```sql
-- Allow access if user is a member of the workspace
CREATE POLICY "Projects: Workspace members can read" ON "Projects"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "WorkspaceMembers"
      WHERE workspace_id = Projects.workspace_id
        AND user_id = auth.uid()
    )
  );

-- Allow admins and members to insert/update/delete
CREATE POLICY "Projects: Admin/Member can modify" ON "Projects"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "WorkspaceMembers"
      WHERE workspace_id = Projects.workspace_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'member')
    )
  );
```

## Example: Tasks Table
```sql
-- Allow access if user is a member of the workspace
CREATE POLICY "Tasks: Workspace members can read" ON "Tasks"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "WorkspaceMembers"
      WHERE workspace_id = Tasks.workspace_id
        AND user_id = auth.uid()
    )
  );

-- Allow only assignee or admins to update
CREATE POLICY "Tasks: Assignee or admin can update" ON "Tasks"
  FOR UPDATE USING (
    (assignee_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM "WorkspaceMembers"
      WHERE workspace_id = Tasks.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );
```

## References
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Policy Examples](https://supabase.com/docs/guides/auth/row-level-security-examples) 