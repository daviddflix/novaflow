import type { FileUpload } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Perform a fetch request against the Supabase REST API with the anon key.
 */
async function supabaseFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...(options.headers || {}),
  } as Record<string, string>;
  return fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
}

/**
 * Upload a file to a storage bucket and record metadata in FileUploads.
 */
export async function uploadFile(params: {
  bucket: 'attachments' | 'avatars';
  file: File;
  userId: string;
  workspaceId: string;
  taskId?: string;
  projectId?: string;
}): Promise<FileUpload> {
  const { bucket, file, userId, workspaceId, taskId, projectId } = params;
  const filePath = `${userId}/${Date.now()}-${file.name}`;

  const uploadRes = await supabaseFetch(`/storage/v1/object/${bucket}/${filePath}`, {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload file');
  }

  const metadata = {
    user_id: userId,
    file_url: filePath,
    type: bucket,
    workspace_id: workspaceId,
    task_id: taskId,
    project_id: projectId,
  } as Record<string, unknown>;

  const metaRes = await supabaseFetch('/rest/v1/FileUploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(metadata),
  });

  if (!metaRes.ok) {
    throw new Error('Failed to store file metadata');
  }

  const [record] = (await metaRes.json()) as FileUpload[];
  return record;
}

/**
 * List attachments for a task or project.
 */
export async function listAttachments(filter: {
  taskId?: string;
  projectId?: string;
}): Promise<FileUpload[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/FileUploads`);
  url.searchParams.set('select', '*');
  if (filter.taskId) url.searchParams.set('task_id', `eq.${filter.taskId}`);
  if (filter.projectId) url.searchParams.set('project_id', `eq.${filter.projectId}`);

  const res = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to list attachments');
  }
  return (await res.json()) as FileUpload[];
}

/**
 * Generate a public URL for a file in storage.
 */
export function getPublicUrl(bucket: 'attachments' | 'avatars', path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
