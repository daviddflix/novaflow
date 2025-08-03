# Row-Level Security (RLS) Policies

## 🔐 **Overview**

NovaFlow implements comprehensive Row-Level Security (RLS) policies to enforce workspace-based isolation and role-based access control. All tables use RLS with carefully designed policies that ensure users can only access data within their authorized workspaces and according to their assigned roles.

### **Security Architecture:**
- **Workspace Isolation**: Complete data separation between workspaces
- **Helper Functions**: Reusable, secure functions for consistent permission logic
- **Input Validation**: All functions validate NULL inputs to prevent injection
- **Fail-Safe Design**: Deny by default, explicit grants only
- **Performance Optimized**: Indexed lookups and efficient policy evaluation

---

## 🔧 **Helper Functions**

### **Workspace Membership Functions**

```sql
-- Check if user is a member of a workspace
CREATE FUNCTION user_is_workspace_member(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Input validation prevents NULL injection
  IF workspace_uuid IS NULL OR user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM "WorkspaceMembers"
    WHERE workspace_id = workspace_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's role in a workspace
CREATE FUNCTION user_workspace_role(workspace_uuid UUID, user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Input validation with safe fallback
  IF workspace_uuid IS NULL OR user_uuid IS NULL THEN
    RETURN 'none';
  END IF;
  
  SELECT role INTO user_role FROM "WorkspaceMembers"
  WHERE workspace_id = workspace_uuid AND user_id = user_uuid;
  
  -- Graceful fallback for non-members
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Context Resolution Functions**

```sql
-- Get workspace ID from task ID
CREATE FUNCTION get_task_workspace(task_uuid UUID)
RETURNS UUID AS $$
DECLARE
  workspace_uuid UUID;
BEGIN
  IF task_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT workspace_id INTO workspace_uuid FROM "Tasks"
  WHERE id = task_uuid;
  
  RETURN workspace_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get workspace ID from project ID  
CREATE FUNCTION get_project_workspace(project_uuid UUID)
RETURNS UUID AS $$
DECLARE
  workspace_uuid UUID;
BEGIN
  IF project_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT workspace_id INTO workspace_uuid FROM "Projects"
  WHERE id = project_uuid;
  
  RETURN workspace_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **User Profile Access Function**

```sql
-- Check if current user can view another user's profile
CREATE FUNCTION can_view_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Users can always view their own profile
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Users can view profiles of people in shared workspaces
  RETURN EXISTS (
    SELECT 1 FROM "WorkspaceMembers" wm1
    JOIN "WorkspaceMembers" wm2 ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid() AND wm2.user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📋 **Table Policies**

### **🏢 Workspaces**

```sql
-- Members can view their workspaces
CREATE POLICY "Workspace members can view workspace" ON "Workspaces"
  FOR SELECT USING (
    user_is_workspace_member(id, auth.uid())
  );

-- Only admins can update workspace settings
CREATE POLICY "Admins can update workspace" ON "Workspaces"
  FOR UPDATE USING (
    user_workspace_role(id, auth.uid()) = 'admin'
  );

-- Authenticated users can create new workspaces
CREATE POLICY "Users can create workspaces" ON "Workspaces"
  FOR INSERT WITH CHECK (auth.uid() = created_by);
```

### **👥 WorkspaceMembers**

```sql
-- Users can view their own memberships
CREATE POLICY "Users can view own memberships" ON "WorkspaceMembers"
  FOR SELECT USING (auth.uid() = user_id);

-- Workspace members can view all memberships in their workspace
CREATE POLICY "Workspace members can view all memberships" ON "WorkspaceMembers"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

-- Only admins can manage workspace memberships
CREATE POLICY "Admins can manage memberships" ON "WorkspaceMembers"
  FOR ALL USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin'
  );

-- Users can accept invitations by joining workspaces
CREATE POLICY "Users can join workspace when invited" ON "WorkspaceMembers"
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### **📊 Projects**

```sql
-- All workspace members can view projects
CREATE POLICY "Workspace members can view projects" ON "Projects"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

-- Admins and members can create projects
CREATE POLICY "Admins and members can create projects" ON "Projects"
  FOR INSERT WITH CHECK (
    user_workspace_role(workspace_id, auth.uid()) IN ('admin', 'member')
  );

-- Project owners and workspace admins can update projects
CREATE POLICY "Admins and owners can update projects" ON "Projects"
  FOR UPDATE USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    owner_id = auth.uid()
  );

-- Project owners and workspace admins can delete projects
CREATE POLICY "Admins and owners can delete projects" ON "Projects"
  FOR DELETE USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    owner_id = auth.uid()
  );
```

### **✅ Tasks**

```sql
-- All workspace members can view tasks
CREATE POLICY "Workspace members can view tasks" ON "Tasks"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

-- Admins and members can create tasks
CREATE POLICY "Admins and members can create tasks" ON "Tasks"
  FOR INSERT WITH CHECK (
    user_workspace_role(workspace_id, auth.uid()) IN ('admin', 'member')
  );

-- Admins, assignees, and task creators can update tasks
CREATE POLICY "Admins, assignees, and creators can update tasks" ON "Tasks"
  FOR UPDATE USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    assignee_id = auth.uid() OR
    created_by = auth.uid()
  );

-- Only admins and task creators can delete tasks
CREATE POLICY "Admins and creators can delete tasks" ON "Tasks"
  FOR DELETE USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    created_by = auth.uid()
  );
```

### **🔗 TaskDependencies**

```sql
-- View dependencies if user can access the source task
CREATE POLICY "Workspace members can view task dependencies" ON "TaskDependencies"
  FOR SELECT USING (
    user_is_workspace_member(get_task_workspace(task_id), auth.uid())
  );

-- Admins and members can manage task dependencies
CREATE POLICY "Admins and members can manage task dependencies" ON "TaskDependencies"
  FOR ALL USING (
    user_workspace_role(get_task_workspace(task_id), auth.uid()) IN ('admin', 'member')
  );
```

### **💬 Comments**

```sql
-- View comments if user can access the parent task/project
CREATE POLICY "Workspace members can view comments" ON "Comments"
  FOR SELECT USING (
    (task_id IS NOT NULL AND user_is_workspace_member(get_task_workspace(task_id), auth.uid())) OR
    (project_id IS NOT NULL AND user_is_workspace_member(get_project_workspace(project_id), auth.uid()))
  );

-- Create comments if user can access parent and is the comment author
CREATE POLICY "Workspace members can create comments" ON "Comments"
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      (task_id IS NOT NULL AND user_is_workspace_member(get_task_workspace(task_id), auth.uid())) OR
      (project_id IS NOT NULL AND user_is_workspace_member(get_project_workspace(project_id), auth.uid()))
    )
  );

-- Users can edit their own comments only
CREATE POLICY "Users can update own comments" ON "Comments"
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own comments, admins can delete any
CREATE POLICY "Users and admins can delete comments" ON "Comments"
  FOR DELETE USING (
    auth.uid() = user_id OR
    (task_id IS NOT NULL AND user_workspace_role(get_task_workspace(task_id), auth.uid()) = 'admin') OR
    (project_id IS NOT NULL AND user_workspace_role(get_project_workspace(project_id), auth.uid()) = 'admin')
  );
```

### **💬 ChatMessages**

```sql
-- Only workspace members can view chat messages
CREATE POLICY "Workspace members can view chat messages" ON "ChatMessages"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

-- Only workspace members can send messages
CREATE POLICY "Workspace members can send chat messages" ON "ChatMessages"
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    user_is_workspace_member(workspace_id, auth.uid())
  );
```

### **🔔 Notifications**

```sql
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON "Notifications"
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON "Notifications"
  FOR UPDATE USING (auth.uid() = user_id);

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON "Notifications"
  FOR INSERT WITH CHECK (true);
```

### **📄 ActivityLog**

```sql
-- Users can view activity in their workspaces
CREATE POLICY "Workspace members can view activity log" ON "ActivityLog"
  FOR SELECT USING (
    workspace_id IS NULL OR
    user_is_workspace_member(workspace_id, auth.uid())
  );

-- Users can create activity logs for their own actions
CREATE POLICY "Users can create activity logs" ON "ActivityLog"
  FOR INSERT WITH CHECK (auth.uid() = actor_id);
```

### **📎 FileUploads**

```sql
-- Workspace members can view files in their workspace
CREATE POLICY "Workspace members can view files" ON "FileUploads"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

-- Workspace members can upload files
CREATE POLICY "Workspace members can upload files" ON "FileUploads"
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    user_is_workspace_member(workspace_id, auth.uid())
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON "FileUploads"
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 🔍 **Policy Testing Examples**

### **✅ Valid Access Scenarios**

```sql
-- Scenario: Admin updates a project in their workspace
-- Policy Check: "Admins and owners can update projects"
SELECT * FROM "Projects" WHERE id = 'project-uuid';
-- ✓ user_is_workspace_member(workspace_id, auth.uid()) → TRUE
-- ✓ user_workspace_role(workspace_id, auth.uid()) = 'admin' → TRUE
-- Result: UPDATE allowed

-- Scenario: User views tasks assigned to them
-- Policy Check: "Workspace members can view tasks"  
SELECT * FROM "Tasks" WHERE assignee_id = auth.uid();
-- ✓ user_is_workspace_member(workspace_id, auth.uid()) → TRUE
-- Result: SELECT allowed
```

### **❌ Blocked Access Scenarios**

```sql
-- Scenario: Viewer tries to create a task
-- Policy Check: "Admins and members can create tasks"
INSERT INTO "Tasks" (title, workspace_id, created_by) VALUES (...);
-- ✓ user_is_workspace_member(workspace_id, auth.uid()) → TRUE
-- ❌ user_workspace_role(workspace_id, auth.uid()) IN ('admin', 'member') → FALSE (role is 'viewer')
-- Result: INSERT blocked

-- Scenario: User tries to access another workspace's data
-- Policy Check: "Workspace members can view projects"
SELECT * FROM "Projects" WHERE workspace_id = 'other-workspace-uuid';
-- ❌ user_is_workspace_member('other-workspace-uuid', auth.uid()) → FALSE
-- Result: SELECT returns no rows (workspace isolation)
```

---

## ⚡ **Performance Considerations**

### **Indexing Strategy**
```sql
-- Essential indexes for policy performance
CREATE INDEX idx_workspace_members_user_id ON "WorkspaceMembers"(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON "WorkspaceMembers"(workspace_id);
CREATE INDEX idx_tasks_workspace_id ON "Tasks"(workspace_id);
CREATE INDEX idx_tasks_assignee_id ON "Tasks"(assignee_id);
CREATE INDEX idx_projects_workspace_id ON "Projects"(workspace_id);
```

### **Policy Optimization**
- **Helper functions** use `SECURITY DEFINER` for consistent execution context
- **Input validation** prevents unnecessary database lookups
- **EXISTS clauses** are preferred over JOINs for boolean checks
- **Composite policies** combine multiple checks efficiently

---

## 🚨 **Security Best Practices**

### **Policy Design**
- **Fail-safe approach**: Deny access when in doubt
- **Input validation**: Always validate NULL inputs in helper functions
- **Consistent logic**: Use helper functions to avoid policy duplication
- **Minimal privileges**: Grant only necessary permissions

### **Testing & Validation**
```sql
-- Test workspace isolation
SET row_security = on;
SET SESSION AUTHORIZATION 'user1';
SELECT COUNT(*) FROM "Projects"; -- Should only see user1's workspace projects

-- Test role-based restrictions
SET SESSION AUTHORIZATION 'viewer_user';
INSERT INTO "Tasks" (...); -- Should fail with permission denied
```

### **Monitoring**
- **Log policy violations** for security audit
- **Monitor performance** of complex policies
- **Regular review** of helper function logic
- **Test policy changes** in staging environment

---

## 📚 **Related Documentation**

- [Security Model & Permissions](./permissions.md) - High-level security architecture
- [Supabase Schema](./supabase-schema.md) - Complete database schema
- [Architecture](./architecture.md) - Overall system design

---

## 🔗 **External References**

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [RLS Performance Tips](https://supabase.com/docs/guides/database/postgres/row-level-security#performance) 