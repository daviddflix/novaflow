import { TextInput, Button, Stack, Title, Container, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUserPlus, IconMail } from '../../lib/icons';
import { inviteUser } from './invite';

export const AdminInvitePage = () => {
  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    await inviteUser(values.email);
    form.reset();
  };

  return (
    <Container size="sm" py="xl">
      <Title order={1} ta="center" mb="md">
        Invite New User
      </Title>
      <Text size="sm" c="dimmed" ta="center" mb="xl">
        Send an invitation email to add a new user to NovaFlow
      </Text>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput 
            label="Email Address" 
            placeholder="user@company.com" 
            size="md"
            leftSection={<IconMail size={16} />}
            {...form.getInputProps('email')} 
          />
          <Button 
            type="submit" 
            size="md" 
            fullWidth
            leftSection={<IconUserPlus size={18} />}
            mt="md"
          >
            Send Invitation
          </Button>
        </Stack>
      </form>
    </Container>
  );
}; 