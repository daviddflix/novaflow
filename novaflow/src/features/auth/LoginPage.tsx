import { TextInput, PasswordInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../context/AuthContext';

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
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label="Email" placeholder="you@example.com" {...form.getInputProps('email')} />
        <PasswordInput label="Password" {...form.getInputProps('password')} />
        <Button type="submit">Login</Button>
      </Stack>
    </form>
  );
};
