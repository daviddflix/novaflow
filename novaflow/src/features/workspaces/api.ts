import { supabase } from '../../services/supabase';
import type { Workspace } from './store';

export type Role = 'admin' | 'member';

export interface WorkspaceMember {
  id: string;
  email: string;
  role: Role;
}

export async function fetchWorkspaces(userId: string): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('owner_id', userId);
  if (error) throw error;
  return (data as Workspace[]) ?? [];
}

export async function createWorkspace(
  name: string,
  ownerId: string,
): Promise<Workspace> {
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, owner_id: ownerId })
    .select('id, name')
    .single();
  if (error) throw error;
  await supabase.from('workspace_members').insert({
    workspace_id: data.id,
    user_id: ownerId,
    role: 'admin',
  });
  return data as Workspace;
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: Role,
) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('User invitation failed');
  await supabase.from('workspace_members').insert({
    workspace_id: workspaceId,
    user_id: userId,
    role,
  });
}

export async function listMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('user_id, role, profiles(email)')
    .eq('workspace_id', workspaceId);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.user_id,
    email: row.profiles?.email ?? '',
    role: row.role as Role,
  }));
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: Role,
) {
  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function removeMember(
  workspaceId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  if (data.role === 'admin') {
    const { data: admins } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'admin');
    if ((admins?.length ?? 0) <= 1) {
      throw new Error('Cannot remove the last admin');
    }
  }
  const { error: delError } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);
  if (delError) throw delError;
}
