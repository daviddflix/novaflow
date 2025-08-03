/**
 * Minimal Supabase client placeholder used for local development and testing.
 * Replace this with the actual `@supabase/supabase-js` client in production.
 */

export interface SupabaseInsertResponse<T> {
  data: T[];
  error: Error | null;
}

export interface SupabaseSelectBuilder<T> {
  eq: (field: string, value: string) => Promise<SupabaseInsertResponse<T>>;
}

export interface SupabaseFromBuilder<T> {
  insert: (payload: T) => Promise<SupabaseInsertResponse<T>>;
  select: () => SupabaseSelectBuilder<T>;
}

export interface SupabaseRealtimeChannel<T> {
  on: (
    event: string,
    filter: Record<string, string>,
    callback: (payload: { new: T }) => void
  ) => SupabaseRealtimeChannel<T>;
  subscribe: () => SupabaseRealtimeChannel<T>;
  unsubscribe: () => void;
}

export interface SupabaseClient {
  from: <T = unknown>(table: string) => SupabaseFromBuilder<T>;
  channel: <T = unknown>(name: string) => SupabaseRealtimeChannel<T>;
}

export const supabase: SupabaseClient = {
  from: <T>() => ({
    insert: async (payload: T) => ({
      data: Array.isArray(payload) ? (payload as T[]) : [payload],
      error: null,
    }),
    select: () => ({
      eq: async () => ({ data: [] as T[], error: null }),
    }),
  }),
  channel: <T>() => {
    const channel: SupabaseRealtimeChannel<T> = {
      on: () => channel,
      subscribe: () => channel,
      unsubscribe: () => {},
    };
    return channel;
  },
};

