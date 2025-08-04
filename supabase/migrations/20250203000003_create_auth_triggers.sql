/*
 * NovaFlow Auth Triggers and Functions Migration
 * ==============================================
 * 
 * Creates triggers and functions for authentication flow, user onboarding,
 * workspace management, notifications, and activity logging.
 * 
 * AUTH & USER MANAGEMENT:
 * -----------------------
 * • handle_new_user()           - Ensures proper metadata on user signup
 * • handle_new_workspace()      - Auto-adds workspace creator as admin
 * • prevent_last_admin_removal() - Prevents removing the last workspace admin
 * 
 * NOTIFICATION SYSTEM:
 * --------------------
 * • create_notification()        - Helper to create user notifications
 * • handle_task_assignment()     - Notifies users when assigned to tasks
 * • handle_mention_notification() - Notifies users when mentioned
 * 
 * ACTIVITY LOGGING:
 * -----------------
 * • log_activity()              - Helper to create audit trail entries
 * 
 * SEARCH INDEXING:
 * ----------------
 * • update_search_index()       - Maintains full-text search index
 * • cleanup_search_index()      - Removes index entries on deletion
 * 
 * TRIGGERS CREATED:
 * -----------------
 * • on_auth_user_created        - Ensures user metadata on signup
 * • on_workspace_created        - Auto-adds creator as admin
 * • prevent_last_admin_removal  - Workspace admin protection
 * • task_assignment_trigger     - Task assignment notifications
 * • mention_notification        - @mention notifications
 * • update_search_index_*       - Search index maintenance (tasks, projects, messages, comments)
 * • cleanup_search_index_*      - Search index cleanup on deletion
 * 
 * FEATURES:
 * ---------
 * • Automatic user onboarding with metadata setup
 * • Workspace admin protection (always keeps at least one admin)
 * • Real-time notifications for task assignments and mentions
 * • Comprehensive activity logging for audit trails
 * • Full-text search index maintenance
 * • Graceful handling of concurrent operations
 * 
 * NOTE: Bootstrap functions removed - using Supabase's built-in auth.signUp() instead
 */

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data IS NULL OR NEW.raw_user_meta_data->>'name' IS NULL THEN
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('name', NEW.email)
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "WorkspaceMembers" (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON "Workspaces"
  FOR EACH ROW EXECUTE FUNCTION handle_new_workspace();

CREATE OR REPLACE FUNCTION prevent_last_admin_removal()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' AND (TG_OP = 'DELETE' OR NEW.role != 'admin') THEN
    IF (SELECT COUNT(*) FROM "WorkspaceMembers" 
        WHERE workspace_id = OLD.workspace_id 
          AND role = 'admin' 
          AND user_id != OLD.user_id) = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last admin from workspace';
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_last_admin_removal_trigger
  BEFORE UPDATE OR DELETE ON "WorkspaceMembers"
  FOR EACH ROW EXECUTE FUNCTION prevent_last_admin_removal();

CREATE OR REPLACE FUNCTION log_activity(
  p_actor_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_workspace_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO "ActivityLog" (actor_id, action, entity_type, entity_id, workspace_id, metadata)
  VALUES (p_actor_id, p_action, p_entity_type, p_entity_id, p_workspace_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO "Notifications" (user_id, type, message)
  VALUES (p_user_id, p_type, p_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL AND (OLD.assignee_id IS NULL OR OLD.assignee_id != NEW.assignee_id) THEN
    PERFORM create_notification(
      NEW.assignee_id,
      'task_assigned',
      'You have been assigned to task: ' || NEW.title
    );
  END IF;
  
  PERFORM log_activity(
    auth.uid(),
    'task_assigned',
    'task',
    NEW.id,
    NEW.workspace_id,
    jsonb_build_object('assignee_id', NEW.assignee_id, 'title', NEW.title)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_assignment_trigger
  AFTER UPDATE ON "Tasks"
  FOR EACH ROW
  WHEN (NEW.assignee_id IS DISTINCT FROM OLD.assignee_id)
  EXECUTE FUNCTION handle_task_assignment();

CREATE OR REPLACE FUNCTION handle_mention_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.mentioned_user_id,
    'mention',
    'You were mentioned in a ' || NEW.source_type
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER mention_notification_trigger
  AFTER INSERT ON "Mentions"
  FOR EACH ROW EXECUTE FUNCTION handle_mention_notification();

CREATE OR REPLACE FUNCTION update_search_index()
RETURNS TRIGGER AS $$
DECLARE
  content_text TEXT;
  workspace_uuid UUID;
  entity_type TEXT;
BEGIN
  IF TG_TABLE_NAME = 'Tasks' THEN
    entity_type := 'task';
    content_text := NEW.title;
    workspace_uuid := NEW.workspace_id;
  ELSIF TG_TABLE_NAME = 'Projects' THEN
    entity_type := 'project';
    content_text := NEW.title || ' ' || COALESCE(NEW.description, '');
    workspace_uuid := NEW.workspace_id;
  ELSIF TG_TABLE_NAME = 'ChatMessages' THEN
    entity_type := 'message';
    content_text := NEW.message;
    workspace_uuid := NEW.workspace_id;
  ELSIF TG_TABLE_NAME = 'Comments' THEN
    entity_type := 'comment';
    content_text := NEW.content;
    IF NEW.task_id IS NOT NULL THEN
      workspace_uuid := get_task_workspace(NEW.task_id);
    ELSE
      workspace_uuid := get_project_workspace(NEW.project_id);
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    DELETE FROM "SearchIndex" WHERE entity_id = NEW.id AND type = entity_type;
  END IF;
  
  INSERT INTO "SearchIndex" (type, content, entity_id, workspace_id)
  VALUES (entity_type, content_text, NEW.id, workspace_uuid)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_search_index_tasks
  AFTER INSERT OR UPDATE ON "Tasks"
  FOR EACH ROW EXECUTE FUNCTION update_search_index();

CREATE TRIGGER update_search_index_projects
  AFTER INSERT OR UPDATE ON "Projects" 
  FOR EACH ROW EXECUTE FUNCTION update_search_index();

CREATE TRIGGER update_search_index_messages
  AFTER INSERT ON "ChatMessages"
  FOR EACH ROW EXECUTE FUNCTION update_search_index();

CREATE TRIGGER update_search_index_comments
  AFTER INSERT OR UPDATE ON "Comments"
  FOR EACH ROW EXECUTE FUNCTION update_search_index();

CREATE OR REPLACE FUNCTION cleanup_search_index()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "SearchIndex" WHERE entity_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER cleanup_search_index_tasks
  AFTER DELETE ON "Tasks"
  FOR EACH ROW EXECUTE FUNCTION cleanup_search_index();

CREATE TRIGGER cleanup_search_index_projects
  AFTER DELETE ON "Projects"
  FOR EACH ROW EXECUTE FUNCTION cleanup_search_index();

CREATE TRIGGER cleanup_search_index_messages
  AFTER DELETE ON "ChatMessages"
  FOR EACH ROW EXECUTE FUNCTION cleanup_search_index();

CREATE TRIGGER cleanup_search_index_comments
  AFTER DELETE ON "Comments"
  FOR EACH ROW EXECUTE FUNCTION cleanup_search_index(); 