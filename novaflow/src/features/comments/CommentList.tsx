import React from 'react';
import { Comment, useComments } from './useComments';

interface CommentListProps {
  taskId?: string;
  projectId?: string;
  currentUserId: string;
  isWorkspaceAdmin?: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({
  taskId,
  projectId,
  currentUserId,
  isWorkspaceAdmin = false,
}) => {
  const { comments, deleteComment } = useComments({ taskId, projectId });

  const canDelete = (comment: Comment) =>
    comment.user_id === currentUserId || isWorkspaceAdmin;

  return (
    <ul>
      {comments.map((comment) => (
        <li key={comment.id}>
          <div>
            <strong>{comment.author?.name ?? 'Unknown'}</strong> ·{' '}
            <span>{new Date(comment.created_at).toLocaleString()}</span>
          </div>
          <p>{comment.content}</p>
          {canDelete(comment) && (
            <button onClick={() => deleteComment(comment.id)}>Delete</button>
          )}
        </li>
      ))}
    </ul>
  );
};
