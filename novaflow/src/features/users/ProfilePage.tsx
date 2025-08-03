import React, { useState } from 'react';
import { FilePicker } from '../file-uploads';
import type { FileUpload } from '../../types';
import { getPublicUrl } from '../../services';

interface ProfilePageProps {
  userId: string;
  workspaceId: string;
}

/**
 * Minimal profile page demonstrating avatar upload.
 */
export const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  workspaceId,
}) => {
  const [avatar, setAvatar] = useState<FileUpload | null>(null);

  const handleUpload = (files: FileUpload[]): void => {
    if (files.length > 0) {
      setAvatar(files[0]);
    }
  };

  const avatarUrl = avatar
    ? getPublicUrl('avatars', avatar.file_url)
    : undefined;

  return (
    <div>
      {avatarUrl && <img src={avatarUrl} alt="avatar" width={100} />}
      <FilePicker
        bucket="avatars"
        userId={userId}
        workspaceId={workspaceId}
        onUpload={handleUpload}
      />
    </div>
  );
};
