import { Button, Group, Select, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { Project, User } from '../../types';
import { useCreateProject, useUpdateProject } from './hooks';

interface ProjectFormProps {
  project?: Project;
  users: User[];
  isAdmin: boolean;
  workspaceId: string;
  onClose?: () => void;
}

export const ProjectForm = ({ project, users, isAdmin, workspaceId, onClose }: ProjectFormProps) => {
  const form = useForm({
    initialValues: {
      title: project?.title || '',
      description: project?.description || '',
      owner_id: project?.owner_id || '',
      status: project?.status || 'Todo',
    },
    validate: {
      description: (value) =>
        value && value.length > 500 ? 'Description must be 500 characters or less' : null,
    },
  });

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const handleSubmit = form.onSubmit(async (values) => {
    if (project) {
      await updateMutation.mutateAsync({ ...project, ...values });
    } else {
      await createMutation.mutateAsync({ ...values, workspace_id: workspaceId });
    }
    onClose?.();
  });

  const ownerOptions = users.map((u) => ({ value: u.id, label: u.name }));

  return (
    <form onSubmit={handleSubmit}>
      <TextInput label="Title" required {...form.getInputProps('title')} />
      <Textarea
        label="Description"
        mt="sm"
        maxLength={500}
        {...form.getInputProps('description')}
      />
      {isAdmin && (
        <Select
          label="Owner"
          mt="sm"
          data={ownerOptions}
          {...form.getInputProps('owner_id')}
        />
      )}
      <Group justify="flex-end" mt="md">
        <Button type="submit">{project ? 'Update' : 'Create'}</Button>
      </Group>
    </form>
  );
};
