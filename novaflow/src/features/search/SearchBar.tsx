import { useState } from 'react';
import { Autocomplete, Loader } from '@mantine/core';
import { supabase } from '../../services/supabase';
import type { SearchResult } from './types';

interface SearchBarProps {
  onResults: (results: SearchResult[]) => void;
}

export function SearchBar({ onResults }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      onResults([]);
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('SearchIndex')
      .select('id, type, content, link')
      .textSearch('content', value);
    setLoading(false);
    if (error || !data) {
      console.error('Search failed', error);
      onResults([]);
      setSuggestions([]);
      return;
    }
    interface SearchIndexRow {
      id: string;
      type: string;
      content: string;
      link: string;
    }
    const results = data.map((row: SearchIndexRow) => ({
      id: row.id,
      type: row.type,
      snippet: row.content.slice(0, 100),
      link: row.link,
    }));
    setSuggestions(results.map((r: SearchResult) => r.snippet));
    onResults(results);
  };

  return (
    <Autocomplete
      placeholder="Search"
      value={query}
      onChange={handleChange}
      data={suggestions}
      rightSection={loading ? <Loader size="xs" /> : null}
    />
  );
}
