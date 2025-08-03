import { supabase } from '../../services/supabase';
import type { SearchIndexEntry } from './types';

// Hook providing manual SearchIndex updates. Replace with automated indexing in future phases.
export function useSearchIndexUpdater() {
  const updateIndex = async (entry: SearchIndexEntry) => {
    return supabase.from('SearchIndex').insert([entry]);
  };

  return { updateIndex };
}
