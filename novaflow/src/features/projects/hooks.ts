import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import type { Project } from '../../types';

export const useProjects = (workspaceId: string) =>
  useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', workspaceId);
      if (error) throw error;
      return data as Project[];
    },
  });

type ProjectInput = Omit<Project, 'id' | 'created_at'>;

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.workspace_id] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Project) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: input.title,
          description: input.description,
          owner_id: input.owner_id,
          status: input.status,
        })
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.workspace_id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; workspace_id: string }) => {
      const { error } = await supabase.from('projects').delete().eq('id', input.id);
      if (error) throw error;
      return input;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', data.workspace_id] });
    },
  });
};
