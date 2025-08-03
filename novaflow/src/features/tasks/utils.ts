import type { Task } from './types'

/**
 * Detects whether adding a dependency would create a circular reference.
 */
export function hasCircularDependency(
  sourceId: string,
  targetId: string,
  tasks: Task[],
): boolean {
  const map = new Map<string, string[]>(tasks.map((t) => [t.id, t.dependencies]))
  const visited = new Set<string>()

  const visit = (id: string): boolean => {
    if (id === sourceId) return true
    if (visited.has(id)) return false
    visited.add(id)
    return (map.get(id) || []).some(visit)
  }

  return visit(targetId)
}
