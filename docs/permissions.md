# NovaFlow Security Model & Permissions

## 🏗️ **Architecture Overview**

NovaFlow implements a **zero-trust, workspace-isolated security model** where every resource is protected by multiple layers of access control. The system ensures complete data separation between workspaces while providing granular role-based permissions within each workspace.

### **Core Security Principles:**
- **Zero-Trust**: Deny by default, explicit permissions required
- **Workspace Isolation**: Complete data separation between workspaces  
- **Role-Based Access Control**: Granular permissions based on user roles
- **Defense in Depth**: Multiple security layers must all pass
- **Audit Trail**: All actions logged for transparency and compliance

---

## 👥 **User Roles & Capabilities**

### **🔍 Viewer**
- **Purpose**: Read-only access for stakeholders, clients, or observers
- **Capabilities**: View all workspace data, cannot create or modify anything
- **Use Cases**: External stakeholders, auditors, read-only team members

### **👤 Member** 
- **Purpose**: Active contributors who create and manage content
- **Capabilities**: Create/edit projects and tasks, participate in chat, manage own content
- **Use Cases**: Team members, developers, project contributors

### **👑 Admin**
- **Purpose**: Workspace managers with full administrative control
- **Capabilities**: All Member capabilities + workspace management, user administration
- **Use Cases**: Team leads, project managers, workspace owners

---

## 🔐 **Resource Access Matrix**

### **🏢 Workspace Level**

| **Resource** | **Viewer** | **Member** | **Admin** | **Creator** |
|--------------|:----------:|:----------:|:---------:|:-----------:|
| View Workspace | ✅ | ✅ | ✅ | ✅ |
| Update Workspace Settings | ❌ | ❌ | ✅ | ✅ |
| Invite/Remove Members | ❌ | ❌ | ✅ | ✅ |
| Change Member Roles | ❌ | ❌ | ✅ | ✅ |
| Delete Workspace | ❌ | ❌ | ❌ | ✅ |

### **📊 Project Level**

| **Action** | **Workspace Member** | **Project Owner** | **Workspace Admin** |
|------------|:--------------------:|:-----------------:|:------------------:|
| View Project | ✅ | ✅ | ✅ |
| Create Project | Member+ | ✅ | ✅ |
| Update Project | ❌ | ✅ | ✅ |
| Delete Project | ❌ | ✅ | ✅ |
| Manage Project Settings | ❌ | ✅ | ✅ |

### **✅ Task Level**

| **Action** | **Viewer** | **Member** | **Creator** | **Assignee** | **Admin** |
|------------|:----------:|:----------:|:-----------:|:------------:|:---------:|
| View Task | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Task | ❌ | ✅ | ✅ | ✅ | ✅ |
| Update Task | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete Task | ❌ | ❌ | ✅ | ❌ | ✅ |
| Assign Task | ❌ | ❌ | ✅ | ❌ | ✅ |
| Change Status | ❌ | ❌ | ✅ | ✅ | ✅ |

### **💬 Communication**

| **Action** | **Viewer** | **Member** | **Author** | **Admin** |
|------------|:----------:|:----------:|:----------:|:---------:|
| View Comments/Chat | ✅ | ✅ | ✅ | ✅ |
| Create Comments/Messages | ❌ | ✅ | ✅ | ✅ |
| Edit Own Content | ❌ | ❌ | ✅ | ✅ |
| Delete Any Content | ❌ | ❌ | ❌ | ✅ |
| Moderate Content | ❌ | ❌ | ❌ | ✅ |

### **📎 Files & Attachments**

| **Action** | **Viewer** | **Member** | **Uploader** | **Admin** |
|------------|:----------:|:----------:|:------------:|:---------:|
| View Files | ✅ | ✅ | ✅ | ✅ |
| Upload Files | ❌ | ✅ | ✅ | ✅ |
| Delete Own Files | ❌ | ❌ | ✅ | ✅ |
| Delete Any Files | ❌ | ❌ | ❌ | ✅ |

---

## 🛡️ **Security Layers**

### **Layer 1: Authentication**
```sql
-- Must be logged in
auth.uid() IS NOT NULL
```

### **Layer 2: Workspace Membership** 
```sql
-- Must be workspace member
user_is_workspace_member(workspace_id, auth.uid()) = TRUE
```

### **Layer 3: Role-Based Access**
```sql
-- Role-specific permissions
user_workspace_role(workspace_id, auth.uid()) IN ('admin', 'member')
```

### **Layer 4: Ownership & Context**
```sql
-- Additional rights for creators/owners
created_by = auth.uid() OR owner_id = auth.uid()
```

### **Layer 5: Business Logic**
```sql
-- Prevent last admin removal, maintain data integrity
prevent_last_admin_removal()
```

---

## 🎯 **Access Control Examples**

### **✅ Scenario 1: Member Views Task**
```sql
Security Checks:
1. ✓ User authenticated (auth.uid())
2. ✓ User in workspace (user_is_workspace_member())
3. ✓ Task visible to all workspace members
Result: ACCESS GRANTED
```

### **❌ Scenario 2: Viewer Tries to Create Task**
```sql
Security Checks:  
1. ✓ User authenticated (auth.uid())
2. ✓ User in workspace (user_is_workspace_member()) 
3. ❌ User role is 'viewer', needs 'member' or 'admin'
Result: ACCESS DENIED
```

### **✅ Scenario 3: Admin Manages Members**
```sql
Security Checks:
1. ✓ User authenticated (auth.uid())
2. ✓ User is workspace admin (user_workspace_role() = 'admin')
Result: ACCESS GRANTED (Full CRUD on WorkspaceMembers)
```

### **❌ Scenario 4: Cross-Workspace Access Attempt**
```sql
Security Checks:
1. ✓ User authenticated (auth.uid())
2. ❌ User not member of target workspace
Result: ACCESS DENIED (Complete workspace isolation)
```

---

## 🔧 **Implementation Details**

### **Frontend Permission Utilities**
```typescript
// lib/permissions.ts
export function canEditProject(user: User, project: Project): boolean {
  return user.role === 'admin' || 
         (user.role === 'member' && project.owner_id === user.id);
}

export function canDeleteTask(user: User, task: Task): boolean {
  return user.role === 'admin' || task.created_by === user.id;
}

export function canManageMembers(user: User): boolean {
  return user.role === 'admin';
}
```

### **Database Helper Functions**
```sql
-- Check workspace membership
CREATE FUNCTION user_is_workspace_member(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "WorkspaceMembers"
    WHERE workspace_id = workspace_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user role in workspace
CREATE FUNCTION user_workspace_role(workspace_uuid UUID, user_uuid UUID) 
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM "WorkspaceMembers"
  WHERE workspace_id = workspace_uuid AND user_id = user_uuid;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚨 **Security Best Practices**

### **Frontend Development**
- **Never trust frontend checks alone** - always enforce in database
- **Hide UI elements** user cannot access to improve UX
- **Show loading states** during permission checks
- **Provide clear error messages** when access is denied

### **Database Policies**
- **Fail-safe design** - deny by default, explicit grants only
- **Input validation** - check for NULL values to prevent injection
- **Consistent helper functions** - reuse logic across policies
- **Comprehensive testing** - test all permission scenarios

### **Monitoring & Auditing**
- **Activity logging** - all actions recorded in ActivityLog table
- **Permission violations** - log and alert on access denials
- **Regular audits** - review permissions and user roles
- **Principle of least privilege** - grant minimum necessary permissions

---

## 📚 **Related Documentation**

- [RLS Policies](./rls-policies.md) - Detailed database policy implementation
- [Architecture](./architecture.md) - Overall system architecture 
- [Supabase Schema](./supabase-schema.md) - Database schema documentation
- [Frontend Guidelines](./frontend-guidelines.md) - UI/UX implementation patterns

---

## 🔗 **External References**

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Access Control Guidelines](https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control) 