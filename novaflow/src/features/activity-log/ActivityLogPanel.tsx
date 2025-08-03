import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface ActivityLogEntry {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  workspace_id: string;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

interface ActivityLogPanelProps {
  workspaceId: string;
  limit?: number;
}

/**
 * Panel component displaying activity log entries for a workspace.
 * Supports basic pagination and realtime updates via Supabase Realtime.
 */
export const ActivityLogPanel = ({ workspaceId, limit = 20 }: ActivityLogPanelProps) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const fetchLogs = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      const from = (pageNum - 1) * limit;
      const to = from + limit - 1;
      const { data, error } = await supabase
        .from<ActivityLogEntry>('ActivityLog')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('timestamp', { ascending: false })
        .range(from, to);
      if (!error && data) {
        setLogs(prev => (pageNum === 1 ? data : [...prev, ...data]));
      }
      setLoading(false);
    },
    [workspaceId, limit]
  );

  useEffect(() => {
    fetchLogs(1);
    const channel = supabase
      .channel('activity-log-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ActivityLog', filter: `workspace_id=eq.${workspaceId}` },
        (payload: { new: ActivityLogEntry }) => {
          setLogs(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [workspaceId, fetchLogs]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void fetchLogs(nextPage);
  };

  const filteredLogs = logs.filter(log => {
    const term = filter.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.entity_type.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Filter by action or entity"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <ul>
        {filteredLogs.map(log => {
          const meta = log.metadata as Record<string, unknown> | null;
          const name =
            (typeof meta?.['name'] === 'string' && (meta['name'] as string)) ||
            (typeof meta?.['title'] === 'string' && (meta['title'] as string));
          const entityDisplay = name || `[Deleted ${log.entity_type}]`;

          return (
            <li key={log.id}>
              <strong>{log.actor_id}</strong> {log.action} {entityDisplay} –
              <em>{new Date(log.timestamp).toLocaleString()}</em>
            </li>
          );
        })}
      </ul>
      {filteredLogs.length === 0 && !loading && <div>No activity yet.</div>}
      {loading && <div>Loading...</div>}
      <button onClick={handleLoadMore} disabled={loading}>
        Load more
      </button>
    </div>
  );
};
