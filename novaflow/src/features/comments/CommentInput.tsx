import React, { useState } from 'react';
import { useComments } from './useComments';

interface CommentInputProps {
  taskId?: string;
  projectId?: string;
  userId: string;
  onCommentAdded?: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  taskId,
  projectId,
  userId,
  onCommentAdded,
}) => {
  const { addComment } = useComments({ taskId, projectId });
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    await addComment(value.trim(), userId);
    setValue('');
    onCommentAdded?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a comment"
      />
      <button type="submit">Post</button>
    </form>
  );
};
