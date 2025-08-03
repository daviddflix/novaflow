import { hasCircularDependency } from './utils'
import type { Task, TaskInput } from './types'

const STORAGE_KEY = 'novaflow.tasks'

function load(): Task[] {
  if (typeof localStorage === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as Task[]) : []
}

function save(tasks: Task[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export async function listTasks(): Promise<Task[]> {
  return load()
}

export async function createTask(input: TaskInput): Promise<Task> {
  const tasks = load()
  const task: Task = {
    id: Date.now().toString(),
    dependencies: [],
    ...input,
  }
  tasks.push(task)
  save(tasks)
  return task
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const tasks = load()
  const index = tasks.findIndex((t) => t.id === id)
  if (index === -1) throw new Error('Task not found')
  const updated = { ...tasks[index], ...input }
  tasks[index] = updated
  save(tasks)
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = load()
  const hasDependents = tasks.some((t) => t.dependencies.includes(id))
  if (hasDependents) {
    throw new Error('Task has dependent tasks')
  }
  save(tasks.filter((t) => t.id !== id))
}

export async function addDependency(
  taskId: string,
  dependencyId: string,
): Promise<void> {
  const tasks = load()
  if (hasCircularDependency(taskId, dependencyId, tasks)) {
    throw new Error('Circular dependency detected')
  }
  const task = tasks.find((t) => t.id === taskId)
  if (task && !task.dependencies.includes(dependencyId)) {
    task.dependencies.push(dependencyId)
    save(tasks)
  }
}

export async function removeDependency(
  taskId: string,
  dependencyId: string,
): Promise<void> {
  const tasks = load()
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    task.dependencies = task.dependencies.filter((d) => d !== dependencyId)
    save(tasks)
  }
}
