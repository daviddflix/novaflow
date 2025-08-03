import { Anchor, List, Text } from '@mantine/core';
import type { SearchResult } from './types';

interface SearchResultsProps {
  results: SearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  if (!results.length) {
    return <Text>No results found.</Text>;
  }

  return (
    <List spacing="sm">
      {results.map((r) => (
        <List.Item key={r.id}>
          <Anchor href={r.link}>
            <Text fw={500}>{r.type}</Text>
            <Text size="sm" c="dimmed">
              {r.snippet}
            </Text>
          </Anchor>
        </List.Item>
      ))}
    </List>
  );
}
