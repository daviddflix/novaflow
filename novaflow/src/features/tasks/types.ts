export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  assignee?: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  tags?: string[]
  dependencies: string[]
}

export interface TaskInput {
  title: string
  assignee?: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  tags?: string[]
}
