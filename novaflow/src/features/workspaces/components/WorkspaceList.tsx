import React, { useEffect, useState } from 'react';
import { fetchWorkspaces } from '../api';
import { useWorkspaceStore, type Workspace } from '../store';
import WorkspaceCreationModal from './WorkspaceCreationModal';

interface Props {
  userId: string;
}

const WorkspaceList: React.FC<Props> = ({ userId }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showModal, setShowModal] = useState(false);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);

  useEffect(() => {
    fetchWorkspaces(userId)
      .then(setWorkspaces)
      .catch((err) => console.error(err));
  }, [userId]);

  const handleCreated = (ws: Workspace) => {
    setWorkspaces((prev) => [...prev, ws]);
    setCurrentWorkspace(ws);
    setShowModal(false);
  };

  return (
    <div>
      <h2>Workspaces</h2>
      <ul>
        {workspaces.map((ws) => (
          <li key={ws.id}>
            <button type="button" onClick={() => setCurrentWorkspace(ws)}>
              {ws.name}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setShowModal(true)}>
        Create Workspace
      </button>
      {showModal && (
        <WorkspaceCreationModal
          ownerId={userId}
          onCreated={handleCreated}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default WorkspaceList;
