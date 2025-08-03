import React from 'react'
import { useDeleteTask, useTasks } from '../hooks'
import type { Task, TaskStatus } from '../types'

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done']

export const TaskBoard: React.FC = () => {
  const { data: tasks = [] } = useTasks()
  const deleteTask = useDeleteTask()

  const handleDelete = (id: string) => {
    deleteTask.mutate(id, {
      onError: (err: unknown) => alert((err as Error).message),
    })
  }

  return (
    <div className="flex gap-4">
      {STATUSES.map((status) => (
        <div key={status} className="flex-1">
          <h3 className="font-bold capitalize">{status.replace('-', ' ')}</h3>
          <ul className="space-y-2">
            {tasks
              .filter((t: Task) => t.status === status)
              .map((task: Task) => (
                <li key={task.id} className="border p-2 rounded">
                  <div className="flex justify-between">
                    <span>{task.title}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
