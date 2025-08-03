import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceStore, type Workspace } from './store';

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().clear();
  });

  it('sets and clears current workspace', () => {
    const ws: Workspace = { id: '1', name: 'Test' };
    useWorkspaceStore.getState().setCurrentWorkspace(ws);
    expect(useWorkspaceStore.getState().currentWorkspace).toEqual(ws);
    useWorkspaceStore.getState().clear();
    expect(useWorkspaceStore.getState().currentWorkspace).toBeNull();
  });
});
