import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../services';

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  task_id?: string;
  project_id?: string;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface UseCommentsArgs {
  taskId?: string;
  projectId?: string;
}

export const useComments = ({ taskId, projectId }: UseCommentsArgs) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('Comments')
      .select('id, content, user_id, created_at, task_id, project_id, author:Users(id, name, avatar_url)')
      .order('created_at', { ascending: true });

    if (taskId) query = query.eq('task_id', taskId);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (!error && data) {
      setComments(data as Comment[]);
    }
    setLoading(false);
  }, [taskId, projectId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const verifyParentExists = useCallback(async () => {
    if (taskId) {
      const { data } = await supabase.from('Tasks').select('id').eq('id', taskId).single();
      if (!data) throw new Error('Task not found');
    }
    if (projectId) {
      const { data } = await supabase.from('Projects').select('id').eq('id', projectId).single();
      if (!data) throw new Error('Project not found');
    }
  }, [taskId, projectId]);

  const addComment = useCallback(
    async (content: string, userId: string) => {
      await verifyParentExists();
      const payload = {
        content,
        user_id: userId,
        task_id: taskId,
        project_id: projectId,
      };
      const { data, error } = await supabase
        .from('Comments')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      if (data) setComments((prev) => [...prev, data as Comment]);
    },
    [taskId, projectId, verifyParentExists]
  );

  const deleteComment = useCallback(async (commentId: string) => {
    const { error } = await supabase.from('Comments').delete().eq('id', commentId);
    if (error) throw error;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  return { comments, loading, fetchComments, addComment, deleteComment };
};
