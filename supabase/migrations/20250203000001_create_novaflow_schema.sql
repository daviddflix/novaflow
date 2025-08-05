/*
 * NovaFlow Core Schema Migration
 * ===============================
 * 
 * Creates the complete database schema for the NovaFlow collaboration platform.
 * Uses auth.users directly (no custom Users table) for simplified architecture.
 * 
 * TABLES CREATED:
 * ---------------
 * • Workspaces          - Isolated workspaces for teams
 * • WorkspaceMembers    - User membership with roles (admin/member/viewer)
 * • Projects            - Projects within workspaces  
 * • Tasks               - Tasks within projects with assignments
 * • TaskDependencies    - Task relationships (blocks/relates_to)
 * • Comments            - Comments on tasks and projects
 * • ChatMessages        - Workspace-level chat messages
 * • Mentions            - @mentions across platform
 * • Notifications       - User notifications
 * • ActivityLog         - Audit trail for user actions
 * • FileUploads         - File attachments
 * • SearchIndex         - Full-text search index
 * 
 * HELPER FUNCTIONS:
 * -----------------
 * • get_user_name()     - Retrieves user display name from auth.users.raw_user_meta_data
 * • get_user_avatar()   - Retrieves user avatar URL from metadata
 * • get_user_email()    - Retrieves user email from auth.users
 * 
 * ARCHITECTURE NOTES:
 * -------------------
 * • All user references point directly to auth.users(id)
 * • User profile data stored in auth.users.raw_user_meta_data
 * • Workspace-based isolation (no global roles)
 * • Comprehensive indexing for performance
 * • Updated_at triggers for change tracking
 */

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "Workspaces" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "WorkspaceMembers" (
  workspace_id UUID NOT NULL REFERENCES "Workspaces"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE "Projects" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT CHECK (length(description) <= 500),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'active',
  workspace_id UUID NOT NULL REFERENCES "Workspaces"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Tasks" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES "Projects"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'Todo' CHECK (status IN ('Todo', 'In Progress', 'Done')),
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date DATE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[],
  workspace_id UUID NOT NULL REFERENCES "Workspaces"(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "TaskDependencies" (
  task_id UUID NOT NULL REFERENCES "Tasks"(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES "Tasks"(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('blocks', 'relates_to')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

CREATE TABLE "Comments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES "Tasks"(id) ON DELETE CASCADE,
  project_id UUID REFERENCES "Projects"(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (task_id IS NOT NULL AND project_id IS NULL) OR 
    (task_id IS NULL AND project_id IS NOT NULL)
  )
);

CREATE TABLE "ChatMessages" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  channel_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES "Workspaces"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Mentions" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL CHECK (source_type IN ('task', 'comment', 'chat')),
  source_id UUID NOT NULL,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Notifications" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "ActivityLog" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  workspace_id UUID REFERENCES "Workspaces"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "FileUploads" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  workspace_id UUID NOT NULL REFERENCES "Workspaces"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "SearchIndex" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('task', 'project', 'message', 'comment')),
  content TEXT NOT NULL,
  entity_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES "Workspaces"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_workspace_members_user_id ON "WorkspaceMembers"(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON "WorkspaceMembers"(workspace_id);
CREATE INDEX idx_projects_workspace_id ON "Projects"(workspace_id);
CREATE INDEX idx_projects_owner_id ON "Projects"(owner_id);
CREATE INDEX idx_tasks_project_id ON "Tasks"(project_id);
CREATE INDEX idx_tasks_workspace_id ON "Tasks"(workspace_id);
CREATE INDEX idx_tasks_assignee_id ON "Tasks"(assignee_id);
CREATE INDEX idx_comments_task_id ON "Comments"(task_id);
CREATE INDEX idx_comments_project_id ON "Comments"(project_id);
CREATE INDEX idx_chat_messages_workspace_id ON "ChatMessages"(workspace_id);
CREATE INDEX idx_notifications_user_id ON "Notifications"(user_id);
CREATE INDEX idx_activity_log_workspace_id ON "ActivityLog"(workspace_id);
CREATE INDEX idx_file_uploads_workspace_id ON "FileUploads"(workspace_id);
CREATE INDEX idx_search_index_workspace_id ON "SearchIndex"(workspace_id);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON "Workspaces" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "Projects" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON "Tasks" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON "Comments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User data helpers (access auth.users metadata)
CREATE OR REPLACE FUNCTION get_user_name(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_name TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN 'Unknown User';
  END IF;
  
  SELECT COALESCE(raw_user_meta_data->>'name', email) INTO user_name
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE(user_name, 'Unknown User');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_avatar(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  avatar_url TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT raw_user_meta_data->>'avatar_url' INTO avatar_url
  FROM auth.users
  WHERE id = user_id;
  
  RETURN avatar_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 