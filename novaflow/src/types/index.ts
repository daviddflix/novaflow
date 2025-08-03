// TypeScript types and interfaces for the application

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
}

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
}

// Project types
export interface Project {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  status?: string;
  created_at: string;
  workspace_id: string;
}

// Task types
export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority?: string;
  due_date?: string;
  assignee_id?: string;
  tags?: string[];
  created_by: string;
  updated_at: string;
  workspace_id: string;
}

export interface TaskDependency {
  task_id: string;
  depends_on_task_id: string;
  type: 'blocks' | 'relates_to';
}

// Additional types will be added as features are developed
