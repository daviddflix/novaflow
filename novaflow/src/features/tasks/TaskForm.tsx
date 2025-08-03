import React, { useState } from 'react';
import { FilePicker, AttachmentList } from '../file-uploads';
import type { FileUpload } from '../../types';

interface TaskFormProps {
  userId: string;
  workspaceId: string;
}

/**
 * Simple task form showcasing attachment uploads.
 */
export const TaskForm: React.FC<TaskFormProps> = ({ userId, workspaceId }) => {
  const [attachments, setAttachments] = useState<FileUpload[]>([]);

  const handleUpload = (files: FileUpload[]): void => {
    setAttachments((prev) => [...prev, ...files]);
  };

  return (
    <form>
      <input type="text" placeholder="Task title" />
      <FilePicker
        bucket="attachments"
        userId={userId}
        workspaceId={workspaceId}
        onUpload={handleUpload}
      />
      <AttachmentList items={attachments} />
    </form>
  );
};
