import React, { useEffect, useState } from 'react';
import {
  listMembers,
  updateMemberRole,
  removeMember,
  type WorkspaceMember,
  type Role,
} from '../api';
import RoleSelector from './RoleSelector';

interface Props {
  workspaceId: string;
}

const MemberList: React.FC<Props> = ({ workspaceId }) => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  useEffect(() => {
    listMembers(workspaceId)
      .then(setMembers)
      .catch((err) => console.error(err));
  }, [workspaceId]);

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await updateMemberRole(workspaceId, userId, role);
      setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role } : m)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeMember(workspaceId, userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Members</h3>
      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.email}{' '}
            <RoleSelector value={m.role} onChange={(r) => handleRoleChange(m.id, r)} />
            <button type="button" onClick={() => handleRemove(m.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberList;
