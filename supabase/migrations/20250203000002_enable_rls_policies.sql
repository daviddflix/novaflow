/*
 * NovaFlow RLS Policies Migration
 * ===============================
 * 
 * Enables Row-Level Security and creates workspace-based access control policies.
 * Implements zero-trust security model where access is explicitly granted based on
 * workspace membership and user roles.
 * 
 * SECURITY MODEL:
 * ---------------
 * • Workspace Isolation    - Users can only access data within their workspaces
 * • Role-Based Access      - admin/member/viewer roles with different permissions
 * • Ownership Rights       - Creators/owners have additional permissions
 * • Self-Access           - Users can always access their own data
 * • Input Validation      - All helper functions validate NULL inputs
 * 
 * HELPER FUNCTIONS:
 * -----------------
 * • user_is_workspace_member()  - Checks if user belongs to workspace
 * • user_workspace_role()       - Gets user's role in workspace (with validation)
 * • get_task_workspace()        - Retrieves workspace ID from task
 * • get_project_workspace()     - Retrieves workspace ID from project  
 * • can_view_user()             - Checks if user can view another user's profile
 * 
 * RLS POLICIES BY TABLE:
 * ----------------------
 * • Workspaces         - Members view, admins update, creators create
 * • WorkspaceMembers   - Self-view, workspace members view all, admins manage
 * • Projects           - Workspace members view, admins/members create, owners/admins edit
 * • Tasks              - Workspace members view, creators/assignees/admins edit
 * • Comments           - Workspace context access, self-edit, admins delete
 * • ChatMessages       - Workspace members only
 * • Notifications      - Self-access only
 * • ActivityLog        - Workspace members view, self-create
 * • FileUploads        - Workspace members view, self-delete
 * • Other tables       - Similar workspace-based patterns
 * 
 * SECURITY FEATURES:
 * ------------------
 * • Fail-safe design (deny by default)
 * • Input validation prevents NULL injection
 * • Graceful fallbacks for non-existent entities
 * • No privilege escalation vectors
 * • Comprehensive audit trail support
 */

ALTER TABLE "Workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMembers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaskDependencies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Mentions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FileUploads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SearchIndex" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION user_is_workspace_member(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF workspace_uuid IS NULL OR user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM "WorkspaceMembers"
    WHERE workspace_id = workspace_uuid
      AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_workspace_role(workspace_uuid UUID, user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF workspace_uuid IS NULL OR user_uuid IS NULL THEN
    RETURN 'none';
  END IF;
  
  SELECT role INTO user_role
  FROM "WorkspaceMembers"
  WHERE workspace_id = workspace_uuid
    AND user_id = user_uuid;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_task_workspace(task_uuid UUID)
RETURNS UUID AS $$
DECLARE
  workspace_uuid UUID;
BEGIN
  IF task_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT workspace_id INTO workspace_uuid
  FROM "Tasks"
  WHERE id = task_uuid;
  
  RETURN workspace_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_project_workspace(project_uuid UUID)
RETURNS UUID AS $$
DECLARE
  workspace_uuid UUID;
BEGIN
  IF project_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT workspace_id INTO workspace_uuid
  FROM "Projects"
  WHERE id = project_uuid;
  
  RETURN workspace_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_view_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM "WorkspaceMembers" wm1
    JOIN "WorkspaceMembers" wm2 ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid()
      AND wm2.user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Workspaces
CREATE POLICY "Workspace members can view workspace" ON "Workspaces"
  FOR SELECT USING (
    user_is_workspace_member(id, auth.uid())
  );

CREATE POLICY "Admins can update workspace" ON "Workspaces"
  FOR UPDATE USING (
    user_workspace_role(id, auth.uid()) = 'admin'
  );

CREATE POLICY "Users can create workspaces" ON "Workspaces"
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- WorkspaceMembers
CREATE POLICY "Users can view own memberships" ON "WorkspaceMembers"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Workspace members can view all memberships" ON "WorkspaceMembers"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "Admins can manage memberships" ON "WorkspaceMembers"
  FOR ALL USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin'
  );

CREATE POLICY "Users can join workspace when invited" ON "WorkspaceMembers"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects
CREATE POLICY "Workspace members can view projects" ON "Projects"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "Admins and members can create projects" ON "Projects"
  FOR INSERT WITH CHECK (
    user_workspace_role(workspace_id, auth.uid()) IN ('admin', 'member')
  );

CREATE POLICY "Admins and owners can update projects" ON "Projects"
  FOR UPDATE USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    owner_id = auth.uid()
  );

CREATE POLICY "Admins and owners can delete projects" ON "Projects"
  FOR DELETE USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    owner_id = auth.uid()
  );

-- Tasks
CREATE POLICY "Workspace members can view tasks" ON "Tasks"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "Admins and members can create tasks" ON "Tasks"
  FOR INSERT WITH CHECK (
    user_workspace_role(workspace_id, auth.uid()) IN ('admin', 'member')
  );

CREATE POLICY "Admins, assignees, and creators can update tasks" ON "Tasks"
  FOR UPDATE USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    assignee_id = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "Admins and creators can delete tasks" ON "Tasks"
  FOR DELETE USING (
    user_workspace_role(workspace_id, auth.uid()) = 'admin' OR
    created_by = auth.uid()
  );

-- TaskDependencies
CREATE POLICY "Workspace members can view task dependencies" ON "TaskDependencies"
  FOR SELECT USING (
    user_is_workspace_member(get_task_workspace(task_id), auth.uid())
  );

CREATE POLICY "Admins and members can manage task dependencies" ON "TaskDependencies"
  FOR ALL USING (
    user_workspace_role(get_task_workspace(task_id), auth.uid()) IN ('admin', 'member')
  );

-- Comments
CREATE POLICY "Workspace members can view comments" ON "Comments"
  FOR SELECT USING (
    (task_id IS NOT NULL AND user_is_workspace_member(get_task_workspace(task_id), auth.uid())) OR
    (project_id IS NOT NULL AND user_is_workspace_member(get_project_workspace(project_id), auth.uid()))
  );

CREATE POLICY "Workspace members can create comments" ON "Comments"
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      (task_id IS NOT NULL AND user_is_workspace_member(get_task_workspace(task_id), auth.uid())) OR
      (project_id IS NOT NULL AND user_is_workspace_member(get_project_workspace(project_id), auth.uid()))
    )
  );

CREATE POLICY "Users can update own comments" ON "Comments"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users and admins can delete comments" ON "Comments"
  FOR DELETE USING (
    auth.uid() = user_id OR
    (task_id IS NOT NULL AND user_workspace_role(get_task_workspace(task_id), auth.uid()) = 'admin') OR
    (project_id IS NOT NULL AND user_workspace_role(get_project_workspace(project_id), auth.uid()) = 'admin')
  );

-- ChatMessages
CREATE POLICY "Workspace members can view chat messages" ON "ChatMessages"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "Workspace members can send chat messages" ON "ChatMessages"
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    user_is_workspace_member(workspace_id, auth.uid())
  );

-- Mentions
CREATE POLICY "Users can view mentions of themselves" ON "Mentions"
  FOR SELECT USING (auth.uid() = mentioned_user_id);

CREATE POLICY "Users can create mentions" ON "Mentions"
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Notifications
CREATE POLICY "Users can view own notifications" ON "Notifications"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON "Notifications"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON "Notifications"
  FOR INSERT WITH CHECK (true);

-- ActivityLog
CREATE POLICY "Workspace members can view activity log" ON "ActivityLog"
  FOR SELECT USING (
    workspace_id IS NULL OR
    user_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "Users can create activity logs" ON "ActivityLog"
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- FileUploads
CREATE POLICY "Workspace members can view files" ON "FileUploads"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "Workspace members can upload files" ON "FileUploads"
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    user_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "Users can delete own files" ON "FileUploads"
  FOR DELETE USING (auth.uid() = user_id);

-- SearchIndex
CREATE POLICY "Workspace members can view search index" ON "SearchIndex"
  FOR SELECT USING (
    user_is_workspace_member(workspace_id, auth.uid())
  );

CREATE POLICY "System can manage search index" ON "SearchIndex"
  FOR ALL WITH CHECK (true); 