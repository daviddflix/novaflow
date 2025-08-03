import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import * as api from './api'
import type { TaskInput } from './types'

export const useTasks = () =>
  useQuery({ queryKey: ['tasks'], queryFn: api.listTasks })

export const useCreateTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export const useUpdateTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskInput }) =>
      api.updateTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export const useDeleteTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export const useAddDependency = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskId,
      dependencyId,
    }: {
      taskId: string
      dependencyId: string
    }) => api.addDependency(taskId, dependencyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export const useRemoveDependency = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskId,
      dependencyId,
    }: {
      taskId: string
      dependencyId: string
    }) => api.removeDependency(taskId, dependencyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
