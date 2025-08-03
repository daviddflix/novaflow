#!/usr/bin/env node
/**
 * Manually update the SearchIndex table.
 * Usage: node scripts/update-search-index.js <id> <type> <content> <link>
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.
 */
import { createClient } from '@supabase/supabase-js';

const [id, type, content, link] = process.argv.slice(2);

if (!id || !type || !content || !link) {
  console.error('Usage: node scripts/update-search-index.js <id> <type> <content> <link>');
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const run = async () => {
  const { error } = await supabase.from('SearchIndex').insert([
    { id, type, content, link },
  ]);
  if (error) {
    console.error('Index update failed:', error.message);
    process.exit(1);
  }
  console.log('Search index updated');
};

run();
