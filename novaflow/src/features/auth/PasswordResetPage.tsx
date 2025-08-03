import { TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { supabase } from '../../lib/supabaseClient';

export const PasswordResetPage = () => {
  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email);
    if (error) {
      notifications.show({ message: error.message, color: 'red' });
    } else {
      notifications.show({ message: 'Password reset email sent', color: 'green' });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label="Email" placeholder="you@example.com" {...form.getInputProps('email')} />
        <Button type="submit">Send Reset Link</Button>
      </Stack>
    </form>
  );
};
