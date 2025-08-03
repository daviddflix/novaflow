import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMentions } from './mentionUtils';

test('extractMentions returns unique usernames', () => {
  const text = 'Hello @alice and @bob and @alice again';
  assert.deepStrictEqual(extractMentions(text), ['alice', 'bob']);
});

test('extractMentions returns empty array when no mentions', () => {
  assert.deepStrictEqual(extractMentions('No mentions here'), []);
});

