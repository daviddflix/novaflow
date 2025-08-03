import { Card, Group, Text, Button } from '@mantine/core';
import { useState } from 'react';
import type { Project, User } from '../../types';
import { useDeleteProject } from './hooks';
import { ProjectForm } from './ProjectForm';

interface ProjectCardProps {
  project: Project;
  users: User[];
  isAdmin: boolean;
}

export const ProjectCard = ({ project, users, isAdmin }: ProjectCardProps) => {
  const [editing, setEditing] = useState(false);
  const deleteMutation = useDeleteProject();

  const handleDelete = () => {
    const confirmed = window.confirm(
      'Deleting a project will also delete all associated tasks. Continue?'
    );
    if (confirmed) {
      deleteMutation.mutate({ id: project.id, workspace_id: project.workspace_id });
    }
  };

  if (editing) {
    return (
      <Card shadow="sm" padding="lg" mt="sm">
        <ProjectForm
          project={project}
          users={users}
          isAdmin={isAdmin}
          workspaceId={project.workspace_id}
          onClose={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" mt="sm">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={500}>{project.title}</Text>
          {project.description && (
            <Text size="sm" c="dimmed">
              {project.description}
            </Text>
          )}
        </div>
        <Group gap="xs">
          <Button size="xs" variant="light" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button size="xs" color="red" variant="light" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Group>
    </Card>
  );
};
