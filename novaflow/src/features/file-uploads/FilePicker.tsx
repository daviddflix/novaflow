import React, { useRef } from 'react';
import { APP_CONSTANTS } from '../../lib';
import { uploadFile } from '../../services';
import type { FileUpload } from '../../types';

interface FilePickerProps {
  bucket: 'attachments' | 'avatars';
  userId: string;
  workspaceId: string;
  taskId?: string;
  projectId?: string;
  onUpload?: (uploads: FileUpload[]) => void;
}

/**
 * Generic file picker component that validates file size/type before upload.
 */
export const FilePicker: React.FC<FilePickerProps> = ({
  bucket,
  userId,
  workspaceId,
  taskId,
  projectId,
  onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const valid: File[] = [];

    files.forEach((file) => {
      if (file.size > APP_CONSTANTS.MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds maximum size`);
        return;
      }
      if (
        bucket === 'avatars' &&
        !APP_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(file.type)
      ) {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }
      valid.push(file);
    });

    const uploads: FileUpload[] = [];
    for (const file of valid) {
      // sequential upload to simplify
      const uploaded = await uploadFile({
        bucket,
        file,
        userId,
        workspaceId,
        taskId,
        projectId,
      });
      uploads.push(uploaded);
    }
    onUpload?.(uploads);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <input
      ref={inputRef}
      type="file"
      onChange={handleChange}
      multiple={bucket === 'attachments'}
    />
  );
};
