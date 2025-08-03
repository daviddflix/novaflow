import type { WorkspaceMember } from '../types';

export type WorkspaceRole = WorkspaceMember['role'];

export const isAdmin = (member?: WorkspaceMember | null): boolean =>
  member?.role === 'admin';

export const canManageMembers = (member?: WorkspaceMember | null): boolean =>
  isAdmin(member);

export const canEditProject = (member?: WorkspaceMember | null): boolean =>
  member?.role === 'admin' || member?.role === 'member';

export const canViewWorkspace = (
  member?: WorkspaceMember | null,
): boolean => Boolean(member);
