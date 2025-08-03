import React from 'react'
import { useAddDependency, useRemoveDependency, useTasks } from '../hooks'
import { hasCircularDependency } from '../utils'
import type { Task } from '../types'

interface Props {
  task: Task
  onClose: () => void
}

export const DependencyModal: React.FC<Props> = ({ task, onClose }) => {
  const { data: tasks = [] } = useTasks()
  const addDep = useAddDependency()
  const removeDep = useRemoveDependency()

  const toggle = (id: string) => {
    if (task.dependencies.includes(id)) {
      removeDep.mutate({ taskId: task.id, dependencyId: id })
    } else {
      if (hasCircularDependency(task.id, id, tasks)) {
        alert('Circular dependency detected')
        return
      }
      addDep.mutate({ taskId: task.id, dependencyId: id })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 w-80 space-y-2">
        <h2 className="font-bold">Dependencies for {task.title}</h2>
        <ul className="max-h-60 overflow-y-auto">
          {tasks
            .filter((t: Task) => t.id !== task.id)
            .map((t: Task) => (
              <li key={t.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.dependencies.includes(t.id)}
                  onChange={() => toggle(t.id)}
                />
                <span>{t.title}</span>
              </li>
            ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 px-2 py-1 w-full"
        >
          Close
        </button>
      </div>
    </div>
  )
}
