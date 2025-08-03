import React, { useState } from 'react'
import { useCreateTask, useUpdateTask } from '../hooks'
import type { Task, TaskInput, TaskStatus } from '../types'

interface Props {
  initial?: Task
  onSuccess?: () => void
}

const defaultValues: TaskInput = {
  title: '',
  assignee: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  tags: [],
}

export const TaskForm: React.FC<Props> = ({ initial, onSuccess }) => {
  const [form, setForm] = useState<TaskInput>(initial || defaultValues)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    if (name === 'tags') {
      setForm({ ...form, tags: value.split(',').map((t) => t.trim()) })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (initial) {
      updateTask.mutate(
        { id: initial.id, data: form },
        { onSuccess },
      )
    } else {
      createTask.mutate(form, { onSuccess })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="border p-1 w-full"
      />
      <input
        name="assignee"
        value={form.assignee}
        onChange={handleChange}
        placeholder="Assignee"
        className="border p-1 w-full"
      />
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="border p-1 w-full"
      >
        {(['todo', 'in-progress', 'done'] as TaskStatus[]).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
        className="border p-1 w-full"
      >
        {['low', 'medium', 'high'].map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="dueDate"
        value={form.dueDate}
        onChange={handleChange}
        className="border p-1 w-full"
      />
      <input
        name="tags"
        value={form.tags?.join(', ')}
        onChange={handleChange}
        placeholder="Tags (comma separated)"
        className="border p-1 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white px-2 py-1">
        {initial ? 'Update' : 'Create'}
      </button>
    </form>
  )
}
