# NovaFlow Supabase Database Setup

This directory contains all database migrations and configuration for the NovaFlow collaboration platform. We use **local Docker containers** for development with plans for **self-hosted infrastructure** in production.

## 🚀 Quick Start - Local Development

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Start local Supabase (Docker required)
supabase start

# 3. Apply migrations to local instance
supabase db reset

# 4. Access local services:
# - Studio: http://localhost:54323
# - API: http://localhost:54321
# - DB: postgresql://postgres:postgres@localhost:54322/postgres
```

## 🐳 Local Development Setup

We use Supabase's local development stack with Docker for:
- **Isolated development** - Each developer has their own complete Supabase instance
- **Faster iteration** - No network latency, instant resets
- **Offline development** - Work without internet connection
- **Safe experimentation** - Break things without affecting others

### Local Services
- **PostgreSQL** - Database on port 54322
- **Kong Gateway** - API Gateway on port 54321  
- **GoTrue** - Auth server
- **PostgREST** - Auto-generated API
- **Realtime** - WebSocket server
- **Storage** - File storage
- **Studio** - Database management UI on port 54323

## 🏗️ Self-Hosting Plans

For production, we're planning self-hosted Supabase infrastructure:
- **Docker Compose** deployment on our own servers
- **Full control** over data and infrastructure
- **Custom configurations** for performance and security
- **Cost optimization** for our specific use case

## 📧 Email Configuration

### Local Development
For local development, emails are handled by **Inbucket** (built-in email server):
- **Email UI**: http://localhost:54324
- **No configuration needed** - works out of the box
- All emails appear in Inbucket UI for testing

### Production (Self-Hosted with SendGrid)

For production deployment, we use **SendGrid** as our SMTP provider:

#### 1. SendGrid Setup
1. Create SendGrid account
2. **Verify your sender identity** for `no-reply@aialphax.io`:
   - Go to SendGrid Dashboard → Settings → Sender Authentication  
   - Add and verify your domain OR single sender email
   - **This step is crucial** - unverified senders will cause "550" errors
3. Generate API key with "Mail Send" permissions
4. Configure SPF/DKIM records for your domain

#### 2. Environment Setup
Create `supabase/.env` with your SendGrid credentials:

```env
# SendGrid API Configuration
GOTRUE_SMTP_PASS=SG.your_sendgrid_api_key_here
GOTRUE_SMTP_ADMIN_EMAIL=no-reply@aialphax.io
```

#### 3. Production Configuration
Use `supabase/config.production.toml` for production deployment:

```toml
[auth.email.smtp]
host = "smtp.sendgrid.net"
port = 587
user = "apikey"
pass = "env(GOTRUE_SMTP_PASS)"
admin_email = "env(GOTRUE_SMTP_ADMIN_EMAIL)"
sender_name = "NovaFlow"
```

#### 4. Deploy to Production
```bash
# Copy production config
cp supabase/config.production.toml supabase/config.toml

# Deploy with SendGrid configuration
supabase start
```

## 📁 Project Structure

```
supabase/
├── README.md                 # This file
└── migrations/              # Database migrations
    ├── 20250203000001_create_novaflow_schema.sql
    ├── 20250203000002_enable_rls_policies.sql
    └── 20250203000003_create_auth_triggers.sql
```

## 🏢 NovaFlow Workspace Architecture Overview

The NovaFlow authentication system is built on three core migrations that establish a secure, workspace-isolated collaboration platform with role-based access control:

### 1. Core Schema Setup (`20250203000001_create_novaflow_schema.sql`)
- **Clean architecture** - Uses Suvabase's built-in `auth.users` directly (no custom Users table)
- **Workspace isolation** - All resources scoped to workspaces for complete data separation
- **Helper functions** - Reusable functions for user data access and workspace membership
- **Performance optimized** - Comprehensive indexing strategy for fast queries

```sql
-- Core tables for workspace collaboration
CREATE TABLE "Workspaces" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- User data helpers accessing auth.users metadata
CREATE FUNCTION get_user_name(user_id UUID) RETURNS TEXT;
CREATE FUNCTION get_user_avatar(user_id UUID) RETURNS TEXT;
```

### 2. Row Level Security Policies (`20250203000002_enable_rls_policies.sql`)
- **Zero-trust model** - Deny by default, explicit permissions required
- **Workspace isolation** - Users can only access data within their workspaces
- **Role-based access** - admin/member/viewer roles with granular permissions
- **Helper functions** - Consistent permission logic across all policies

```sql
-- Core security helper functions
CREATE FUNCTION user_is_workspace_member(workspace_uuid UUID, user_uuid UUID) RETURNS BOOLEAN;
CREATE FUNCTION user_workspace_role(workspace_uuid UUID, user_uuid UUID) RETURNS TEXT;

-- Example workspace isolation policy
CREATE POLICY "Workspace members can view projects" ON "Projects"
  FOR SELECT USING (user_is_workspace_member(workspace_id, auth.uid()));
```

### 3. Authentication Triggers & Automation (`20250203000003_create_auth_triggers.sql`)
- **User onboarding** - Automatic metadata setup on signup
- **Workspace management** - Auto-add creators as admins, prevent last admin removal
- **Notification system** - Real-time notifications for assignments and mentions
- **Activity logging** - Comprehensive audit trail for all user actions
- **Search indexing** - Automatic full-text search index maintenance

```sql
-- Auto-setup user metadata on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Prevent removing last workspace admin
CREATE TRIGGER prevent_last_admin_removal_trigger
  BEFORE UPDATE OR DELETE ON "WorkspaceMembers"
  FOR EACH ROW EXECUTE FUNCTION prevent_last_admin_removal();
```

## 🛠 Working with Migrations

```bash
# Apply migrations to your cloud project
npm run db:push

# Check migration status
npm run db:status

# Create new migration file
npm run db:new migration_name

# Generate migration from dashboard changes
npm run db:diff -f migration_name
```

## 🎯 NovaFlow Workspace-Based Access Control

The NovaFlow system implements a workspace-isolated, role-based hierarchy:

### Workspace Roles

| Role | Purpose | Capabilities | Can Create | Can Manage |
|------|---------|--------------|------------|------------|
| `viewer` | Read-only access | View all workspace data | Nothing | Own notifications |
| `member` | Active contributor | Create/edit projects & tasks, chat | Projects, Tasks, Comments | Own content |
| `admin` | Workspace manager | All member capabilities + administration | Everything | Members, Workspace |

### Resource Access Matrix

| Resource | Viewer | Member | Admin | Creator/Owner |
|----------|:------:|:------:|:-----:|:-------------:|
| **Workspace** | View | View | Manage | Full Control |
| **Projects** | View | Create/View | Full Access | Full Control |
| **Tasks** | View | Create/Edit | Full Access | Full Control |
| **Comments** | View | Create/Edit Own | Delete Any | Edit Own |
| **Chat** | View | Participate | Moderate | Participate |
| **Files** | View | Upload | Manage All | Delete Own |

## 📊 Database Schema Highlights

### Core Tables
- **Workspaces** - Isolated environments for teams
- **WorkspaceMembers** - User membership with roles
- **Projects** - Project management within workspaces
- **Tasks** - Task management with assignments and dependencies
- **Comments** - Threaded discussions on tasks/projects
- **ChatMessages** - Real-time workspace communication
- **Notifications** - User notification system
- **ActivityLog** - Comprehensive audit trail

### Helper Functions
```sql
-- Workspace & Role Management
user_is_workspace_member(workspace_uuid, user_uuid) → BOOLEAN
user_workspace_role(workspace_uuid, user_uuid) → TEXT

-- User Profile Access  
get_user_name(user_id) → TEXT
get_user_avatar(user_id) → TEXT
get_user_email(user_id) → TEXT

-- Context Resolution
get_task_workspace(task_uuid) → UUID
get_project_workspace(project_uuid) → UUID
```

## 🚨 Security Features

### What's Protected
- ✅ **Workspace isolation** - Complete data separation between workspaces
- ✅ **Role-based access** - Granular permissions enforced at database level
- ✅ **Input validation** - All helper functions validate NULL inputs
- ✅ **Fail-safe design** - Deny by default, explicit grants only
- ✅ **Audit trail** - All actions logged with workspace context
- ✅ **Admin protection** - Cannot remove last workspace admin

### Security Layers
1. **Authentication** - Must be logged in (`auth.uid()`)
2. **Workspace Membership** - Must belong to workspace
3. **Role-Based Access** - Role-specific permissions  
4. **Ownership Rights** - Additional rights for creators/owners
5. **Business Logic** - Prevent invalid operations

### What to Avoid
- ❌ **Never bypass RLS** in application code (use service role only for system operations)
- ❌ **Don't assume workspace access** - Always validate membership in frontend
- ❌ **No cross-workspace queries** - Users isolated to their workspaces only
- ❌ **Don't trust frontend checks alone** - All permissions enforced in database

## 🔧 Making Schema Changes

**Option 1: Write SQL migrations**
```bash
npm run db:new add_new_feature
# Edit the generated SQL file in supabase/migrations/
npm run db:push
```

**Option 2: Use Supabase Studio**
```bash
# Make changes in your Supabase dashboard
npm run db:diff -f add_new_feature
npm run db:push
```

## 🆘 Troubleshooting

**Can't link to project**
```bash
supabase login
supabase projects list
supabase link --project-ref YOUR_PROJECT_ID
```

**Migration issues**
```bash
npm run db:status  # Check what's applied
# Review conflicts in Supabase Studio dashboard
```

## 📚 Documentation
- **[Database Schema](../docs/supabase-schema.md)** - Complete schema documentation
- **[Security Model](../docs/permissions.md)** - Access control guide
- **[RLS Policies](../docs/rls-policies.md)** - Policy implementation details

## 🤝 Team Workflow

### For New Team Members
1. Complete the Quick Start setup above
2. Review the [Database Schema](../docs/supabase-schema.md)
3. Read the [Security Model documentation](../docs/permissions.md)

### For Database Changes
1. Create migration using `npm run db:new migration_name`
2. Apply with `npm run db:push`
3. Update documentation as needed 