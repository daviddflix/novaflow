import { Button, Loader, Stack } from '@mantine/core';
import { useState } from 'react';
import type { User } from '../../types';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { useProjects } from './hooks';

interface ProjectsListProps {
  workspaceId: string;
  users: User[];
  isAdmin: boolean;
}

export const ProjectsList = ({ workspaceId, users, isAdmin }: ProjectsListProps) => {
  const { data, isLoading } = useProjects(workspaceId);
  const [creating, setCreating] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Stack>
      {data?.map((project) => (
      <ProjectCard key={project.id} project={project} users={users} isAdmin={isAdmin} />
      ))}
      {creating ? (
        <ProjectForm
          users={users}
          isAdmin={isAdmin}
          workspaceId={workspaceId}
          onClose={() => setCreating(false)}
        />
      ) : (
        <Button onClick={() => setCreating(true)}>New Project</Button>
      )}
    </Stack>
  );
};
