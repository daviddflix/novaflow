import React from 'react';
import { getPublicUrl } from '../../services';
import type { FileUpload } from '../../types';

interface AttachmentListProps {
  items: FileUpload[];
}

/**
 * Renders list of attachments with download links.
 */
export const AttachmentList: React.FC<AttachmentListProps> = ({ items }) => (
  <ul>
    {items.map((item) => {
      const url = getPublicUrl(item.type as 'attachments' | 'avatars', item.file_url);
      const name = item.file_url.split('/').pop();
      return (
        <li key={item.id}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        </li>
      );
    })}
  </ul>
);
