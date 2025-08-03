import { supabase } from '../services/supabase';

export interface ActivityLogPayload {
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  workspace_id: string;
  metadata?: Record<string, unknown>;
}

/**
 * Insert a new activity log entry. Intended to be called after CRUD events.
 * Throws an error if the insert fails so callers can handle failures.
 */
export const logActivity = async (payload: ActivityLogPayload): Promise<void> => {
  const entry = { ...payload, timestamp: new Date().toISOString() };
  const { error } = await supabase.from('ActivityLog').insert([entry]);
  if (error) {
    // Surface the error so callers can handle it (toast, etc.)
    throw error;
  }
};
