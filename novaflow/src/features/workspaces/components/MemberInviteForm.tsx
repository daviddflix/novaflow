import React, { useState } from 'react';
import { inviteMember, type Role } from '../api';
import RoleSelector from './RoleSelector';

interface Props {
  workspaceId: string;
  onInvited?: () => void;
}

const MemberInviteForm: React.FC<Props> = ({ workspaceId, onInvited }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inviteMember(workspaceId, email, role);
      setEmail('');
      setRole('member');
      onInvited?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="User email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <RoleSelector value={role} onChange={setRole} />
      <button type="submit" disabled={loading}>
        Invite
      </button>
    </form>
  );
};

export default MemberInviteForm;
