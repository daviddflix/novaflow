import React from 'react';
import type { Role } from '../api';

interface Props {
  value: Role;
  onChange: (role: Role) => void;
}

const RoleSelector: React.FC<Props> = ({ value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value as Role)}>
    <option value="member">Member</option>
    <option value="admin">Admin</option>
  </select>
);

export default RoleSelector;
