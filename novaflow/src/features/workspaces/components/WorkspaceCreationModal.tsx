import React, { useState } from 'react';
import { createWorkspace } from '../api';
import type { Workspace } from '../store';

interface Props {
  ownerId: string;
  onCreated: (workspace: Workspace) => void;
  onClose: () => void;
}

const WorkspaceCreationModal: React.FC<Props> = ({ ownerId, onCreated, onClose }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const workspace = await createWorkspace(name, ownerId);
      onCreated(workspace);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h3>Create Workspace</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workspace name"
        />
        <button type="submit">Create</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default WorkspaceCreationModal;
