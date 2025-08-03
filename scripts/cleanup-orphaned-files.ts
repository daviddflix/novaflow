/* eslint-env node */
import { FileUpload } from '../novaflow/src/types';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';

async function supabaseFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    ...(options.headers || {}),
  } as Record<string, string>;
  return fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
}

async function listStoredObjects(bucket: string): Promise<string[]> {
  const res = await supabaseFetch(`/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '' }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { name: string }[];
  return data.map((o) => o.name);
}

async function listRecordedFiles(): Promise<FileUpload[]> {
  const res = await supabaseFetch('/rest/v1/FileUploads?select=*');
  if (!res.ok) return [];
  return (await res.json()) as FileUpload[];
}

/**
 * Removes files in storage that lack corresponding FileUploads records.
 */
export async function cleanupOrphanedFiles(): Promise<void> {
  const [records, stored] = await Promise.all([
    listRecordedFiles(),
    listStoredObjects('attachments'),
  ]);
  const recordedPaths = new Set(records.map((r) => r.file_url));
  const orphans = stored.filter((p) => !recordedPaths.has(p));
  for (const path of orphans) {
    // eslint-disable-next-line no-await-in-loop
    await supabaseFetch(`/storage/v1/object/attachments/${path}`, {
      method: 'DELETE',
    });
  }
}

// Execute when run directly
cleanupOrphanedFiles();
