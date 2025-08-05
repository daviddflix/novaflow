# NovaFlow Supabase Schema

## 🏗️ **Architecture Overview**

NovaFlow uses a **clean, simplified database architecture** built on Supabase Postgres. The schema leverages Supabase's built-in `auth.users` table for user management, eliminating data duplication and simplifying the overall design.

### **Key Design Principles:**
- **Leverage Supabase Auth**: Use `auth.users` directly, no custom Users table
- **Workspace Isolation**: All data is scoped to workspaces
- **Zero Duplication**: No redundant user data across tables
- **Performance Optimized**: Comprehensive indexing strategy
- **Security First**: RLS enabled on all tables with helper functions

---

## 👤 **User Management**

### **auth.users (Supabase Built-in)**
NovaFlow uses Supabase's native authentication table with custom metadata:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Primary user identifier |
| `email` | TEXT | User's email address |
| `raw_user_meta_data` | JSONB | Custom user profile data |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last profile update |

#### **User Metadata Structure**
```json
{
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### **Helper Functions for User Data**
```sql
-- Get user display name (with fallback to email)
get_user_name(user_id UUID) → TEXT

-- Get user avatar URL
get_user_avatar(user_id UUID) → TEXT  

-- Get user email address
get_user_email(user_id UUID) → TEXT
```

---

## 🏢 **Core Tables**

### **Workspaces**
Isolated environments for teams and organizations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Workspace identifier |
| `name` | TEXT | NOT NULL | Workspace display name |
| `created_by` | UUID | NOT NULL, FK → auth.users(id) | Workspace creator |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### **WorkspaceMembers**  
User membership and roles within workspaces.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `workspace_id` | UUID | FK → Workspaces(id) ON DELETE CASCADE | Workspace reference |
| `user_id` | UUID | FK → auth.users(id) ON DELETE CASCADE | User reference |
| `role` | TEXT | CHECK IN ('admin', 'member', 'viewer') | User role in workspace |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() | Membership start date |

**Primary Key:** (`workspace_id`, `user_id`)

### **Projects**
Project management within workspaces.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Project identifier |
| `title` | TEXT | NOT NULL | Project title |
| `description` | TEXT | CHECK length ≤ 500 | Project description |
| `owner_id` | UUID | NOT NULL, FK → auth.users(id) | Project owner |
| `status` | TEXT | DEFAULT 'active' | Project status |
| `workspace_id` | UUID | NOT NULL, FK → Workspaces(id) | Parent workspace |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### **Tasks**
Task management with assignments and dependencies.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Task identifier |
| `project_id` | UUID | NOT NULL, FK → Projects(id) | Parent project |
| `title` | TEXT | NOT NULL | Task title |
| `status` | TEXT | DEFAULT 'Todo', CHECK IN ('Todo', 'In Progress', 'Done') | Task status |
| `priority` | TEXT | CHECK IN ('Low', 'Medium', 'High') | Task priority |
| `due_date` | DATE | | Task deadline |
| `assignee_id` | UUID | FK → auth.users(id) ON DELETE SET NULL | Assigned user |
| `tags` | TEXT[] | | Task tags array |
| `workspace_id` | UUID | NOT NULL, FK → Workspaces(id) | Parent workspace |
| `created_by` | UUID | NOT NULL, FK → auth.users(id) | Task creator |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### **TaskDependencies**
Task relationships and dependencies.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `task_id` | UUID | FK → Tasks(id) ON DELETE CASCADE | Source task |
| `depends_on_task_id` | UUID | FK → Tasks(id) ON DELETE CASCADE | Target task |
| `type` | TEXT | NOT NULL, CHECK IN ('blocks', 'relates_to') | Relationship type |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Primary Key:** (`task_id`, `depends_on_task_id`)  
**Constraint:** `task_id != depends_on_task_id`

---

## 💬 **Communication Tables**

### **Comments**
Comments on tasks and projects.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Comment identifier |
| `task_id` | UUID | FK → Tasks(id) ON DELETE CASCADE | Parent task (nullable) |
| `project_id` | UUID | FK → Projects(id) ON DELETE CASCADE | Parent project (nullable) |
| `user_id` | UUID | NOT NULL, FK → auth.users(id) | Comment author |
| `content` | TEXT | NOT NULL | Comment content |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Constraint:** Exactly one of `task_id` or `project_id` must be NOT NULL.

### **ChatMessages**
Real-time workspace chat messages.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Message identifier |
| `sender_id` | UUID | NOT NULL, FK → auth.users(id) | Message sender |
| `message` | TEXT | NOT NULL | Message content |
| `channel_id` | UUID | NOT NULL | Channel identifier |
| `workspace_id` | UUID | NOT NULL, FK → Workspaces(id) | Parent workspace |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### **Mentions**
@mentions across the platform.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Mention identifier |
| `source_type` | TEXT | NOT NULL, CHECK IN ('task', 'comment', 'chat') | Source content type |
| `source_id` | UUID | NOT NULL | Source content ID |
| `mentioned_user_id` | UUID | NOT NULL, FK → auth.users(id) | Mentioned user |
| `created_by` | UUID | NOT NULL, FK → auth.users(id) | Mention creator |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

## 🔔 **System Tables**

### **Notifications**
User notifications and alerts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Notification identifier |
| `user_id` | UUID | NOT NULL, FK → auth.users(id) | Target user |
| `type` | TEXT | NOT NULL | Notification type |
| `message` | TEXT | NOT NULL | Notification message |
| `read` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### **ActivityLog**
Audit trail for user actions.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Log entry identifier |
| `actor_id` | UUID | NOT NULL, FK → auth.users(id) | User who performed action |
| `action` | TEXT | NOT NULL | Action performed |
| `entity_type` | TEXT | NOT NULL | Type of entity affected |
| `entity_id` | UUID | NOT NULL | ID of entity affected |
| `metadata` | JSONB | | Additional action metadata |
| `workspace_id` | UUID | FK → Workspaces(id) | Related workspace |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Action timestamp |

### **FileUploads**
File attachments and uploads.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | File identifier |
| `user_id` | UUID | NOT NULL, FK → auth.users(id) | File uploader |
| `file_url` | TEXT | NOT NULL | File storage URL |
| `file_name` | TEXT | NOT NULL | Original filename |
| `file_size` | INTEGER | | File size in bytes |
| `mime_type` | TEXT | | File MIME type |
| `workspace_id` | UUID | NOT NULL, FK → Workspaces(id) | Parent workspace |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |

### **SearchIndex**
Full-text search index.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Index entry identifier |
| `type` | TEXT | NOT NULL, CHECK IN ('task', 'project', 'message', 'comment') | Content type |
| `content` | TEXT | NOT NULL | Searchable content |
| `entity_id` | UUID | NOT NULL | Source entity ID |
| `workspace_id` | UUID | NOT NULL, FK → Workspaces(id) | Parent workspace |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Index timestamp |

---

## 🔧 **Helper Functions**

### **Workspace & Role Functions**
```sql
-- Check if user is member of workspace
user_is_workspace_member(workspace_uuid UUID, user_uuid UUID) → BOOLEAN

-- Get user's role in workspace
user_workspace_role(workspace_uuid UUID, user_uuid UUID) → TEXT

-- Get workspace ID from task
get_task_workspace(task_uuid UUID) → UUID

-- Get workspace ID from project  
get_project_workspace(project_uuid UUID) → UUID

-- Check if user can view another user's profile
can_view_user(target_user_id UUID) → BOOLEAN
```

### **User Profile Functions**
```sql
-- Get user display name with fallback
get_user_name(user_id UUID) → TEXT

-- Get user avatar URL
get_user_avatar(user_id UUID) → TEXT

-- Get user email address  
get_user_email(user_id UUID) → TEXT
```

### **System Functions**
```sql  
-- Create user notification
create_notification(user_id UUID, type TEXT, message TEXT) → VOID

-- Log user activity
log_activity(actor_id UUID, action TEXT, entity_type TEXT, entity_id UUID, workspace_id UUID, metadata JSONB) → VOID

-- Update timestamps automatically
update_updated_at_column() → TRIGGER
```

---

## ⚡ **Performance Indexes**

### **Workspace & Membership Indexes**
```sql
CREATE INDEX idx_workspace_members_user_id ON "WorkspaceMembers"(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON "WorkspaceMembers"(workspace_id);
```

### **Content Indexes**
```sql
CREATE INDEX idx_projects_workspace_id ON "Projects"(workspace_id);
CREATE INDEX idx_projects_owner_id ON "Projects"(owner_id);
CREATE INDEX idx_tasks_project_id ON "Tasks"(project_id);
CREATE INDEX idx_tasks_workspace_id ON "Tasks"(workspace_id);
CREATE INDEX idx_tasks_assignee_id ON "Tasks"(assignee_id);
```

### **Communication Indexes**
```sql
CREATE INDEX idx_comments_task_id ON "Comments"(task_id);
CREATE INDEX idx_comments_project_id ON "Comments"(project_id);
CREATE INDEX idx_chat_messages_workspace_id ON "ChatMessages"(workspace_id);
```

### **System Indexes**
```sql
CREATE INDEX idx_notifications_user_id ON "Notifications"(user_id);
CREATE INDEX idx_activity_log_workspace_id ON "ActivityLog"(workspace_id);
CREATE INDEX idx_file_uploads_workspace_id ON "FileUploads"(workspace_id);
CREATE INDEX idx_search_index_workspace_id ON "SearchIndex"(workspace_id);
```

---

## 🤖 **Triggers & Automation**

### **User Management Triggers**
```sql
-- Auto-setup user metadata on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-add workspace creator as admin
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON "Workspaces"
  FOR EACH ROW EXECUTE FUNCTION handle_new_workspace();

-- Prevent removing last workspace admin
CREATE TRIGGER prevent_last_admin_removal_trigger
  BEFORE UPDATE OR DELETE ON "WorkspaceMembers"
  FOR EACH ROW EXECUTE FUNCTION prevent_last_admin_removal();
```

### **Notification Triggers**
```sql
-- Notify users when assigned to tasks
CREATE TRIGGER task_assignment_trigger
  AFTER UPDATE ON "Tasks"
  FOR EACH ROW EXECUTE FUNCTION handle_task_assignment();

-- Notify users when mentioned
CREATE TRIGGER mention_notification_trigger
  AFTER INSERT ON "Mentions"
  FOR EACH ROW EXECUTE FUNCTION handle_mention_notification();
```

### **Search Index Triggers**
```sql
-- Maintain search index for tasks, projects, messages, comments
CREATE TRIGGER update_search_index_tasks
  AFTER INSERT OR UPDATE ON "Tasks"
  FOR EACH ROW EXECUTE FUNCTION update_search_index();

-- Clean up search index on deletion
CREATE TRIGGER cleanup_search_index_tasks  
  AFTER DELETE ON "Tasks"
  FOR EACH ROW EXECUTE FUNCTION cleanup_search_index();
```

### **Timestamp Triggers**
```sql
-- Auto-update timestamps on record changes
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON "Workspaces"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔐 **Security Features**

### **Row-Level Security (RLS)**
- **All tables have RLS enabled**
- **Workspace-based isolation** - users can only access their workspace data
- **Role-based permissions** - admin/member/viewer roles enforced at database level
- **Helper functions** provide consistent permission logic across all policies

### **Input Validation**
- **NULL validation** in all helper functions prevents injection attacks
- **CHECK constraints** enforce data integrity (roles, statuses, etc.)
- **Foreign key constraints** maintain referential integrity

### **Audit Trail**
- **ActivityLog table** captures all user actions with metadata
- **Workspace context** preserved for all activities
- **Comprehensive logging** for compliance and debugging

---

## 🔗 **Relationships Summary**

### **User Relationships**  
- `auth.users` ← **WorkspaceMembers** → `Workspaces` (many-to-many)
- `auth.users` ← `Projects.owner_id` (one-to-many)
- `auth.users` ← `Tasks.assignee_id` (one-to-many)
- `auth.users` ← `Tasks.created_by` (one-to-many)

### **Workspace Hierarchy**
- `Workspaces` → `Projects` → `Tasks` → `Comments`
- `Workspaces` → `ChatMessages`
- `Workspaces` → `FileUploads`

### **Cross-References**
- `Tasks` ← `TaskDependencies` → `Tasks` (self-referencing many-to-many)
- `Tasks` ← `Comments.task_id` (one-to-many)
- `Projects` ← `Comments.project_id` (one-to-many)

---

## 🚀 **Key Advantages**

### **Simplified Architecture**
- **No duplicate user data** - leverage Supabase auth.users directly
- **Single source of truth** for user information
- **Reduced complexity** with fewer tables and relationships

### **Performance Optimized**
- **Strategic indexing** on frequently queried columns
- **Efficient helper functions** with input validation
- **Optimized RLS policies** using EXISTS clauses

### **Security First**
- **Zero-trust model** with workspace isolation
- **Defense in depth** with multiple security layers
- **Comprehensive audit trail** for compliance

### **Developer Experience**
- **Clean API surface** with consistent helper functions
- **Predictable behavior** across all operations
- **Comprehensive documentation** with real examples

---

## 📚 **Related Documentation**

- [Security Model & Permissions](./permissions.md) - Complete access control guide
- [RLS Policies](./rls-policies.md) - Detailed policy implementation
- [Architecture](./architecture.md) - High-level system design

---

## 🔗 **External References**

- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Supabase Auth Schema](https://supabase.com/docs/guides/auth/managing-user-data)
- [PostgreSQL UUID Functions](https://www.postgresql.org/docs/current/uuid-ossp.html)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html) 