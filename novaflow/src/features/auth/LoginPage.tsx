import { TextInput, PasswordInput, Button, Stack, Anchor, Title, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconLogin, IconMail, IconLock } from '../../lib/icons';

export const LoginPage = () => {
  const { login } = useAuth();
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length > 0 ? null : 'Required'),
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    const { error } = await login(values.email, values.password);
    if (error) {
      notifications.show({ message: error.message, color: 'red' });
    } else {
      notifications.show({ message: 'Logged in', color: 'green' });
    }
  };

  return (
    <Container size="xs" py="xl">
      <Title order={1} ta="center" mb="xl">
        Login to NovaFlow
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput 
            label="Email" 
            placeholder="you@example.com" 
            size="md"
            leftSection={<IconMail size={16} />}
            {...form.getInputProps('email')} 
          />
          <PasswordInput 
            label="Password" 
            size="md"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('password')} 
          />
          <Button 
            type="submit" 
            size="md" 
            fullWidth
            leftSection={<IconLogin size={18} />}
            mt="md"
          >
            Login
          </Button>
          <Anchor component={Link} to="/reset-password" size="sm" ta="center">
            Forgot your password?
          </Anchor>
        </Stack>
      </form>
    </Container>
  );
};
