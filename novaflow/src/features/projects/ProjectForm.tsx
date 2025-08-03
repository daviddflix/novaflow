import React, { useState } from 'react';
import { FilePicker, AttachmentList } from '../file-uploads';
import type { FileUpload } from '../../types';

interface ProjectFormProps {
  userId: string;
  workspaceId: string;
}

/**
 * Simple project form with attachment uploads.
 */
export const ProjectForm: React.FC<ProjectFormProps> = ({ userId, workspaceId }) => {
  const [attachments, setAttachments] = useState<FileUpload[]>([]);

  const handleUpload = (files: FileUpload[]): void => {
    setAttachments((prev) => [...prev, ...files]);
  };

  return (
    <form>
      <input type="text" placeholder="Project title" />
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
