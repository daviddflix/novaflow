import React, { useEffect, useState } from 'react';
import { fetchWorkspaces } from '../api';
import { useWorkspaceStore, type Workspace } from '../store';

interface Props {
  userId: string;
}

const WorkspaceSwitcher: React.FC<Props> = ({ userId }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces(userId)
      .then(setWorkspaces)
      .catch((err) => console.error(err));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ws = workspaces.find((w) => w.id === e.target.value);
    if (ws) setCurrentWorkspace(ws);
  };

  return (
    <select value={currentWorkspace?.id ?? ''} onChange={handleChange}>
      <option value="" disabled>
        Select workspace
      </option>
      {workspaces.map((ws) => (
        <option key={ws.id} value={ws.id}>
          {ws.name}
        </option>
      ))}
    </select>
  );
};

export default WorkspaceSwitcher;
