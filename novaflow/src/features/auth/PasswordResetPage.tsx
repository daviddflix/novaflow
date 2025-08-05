import { TextInput, Button, Stack, Anchor, Title, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { IconMail, IconArrowLeft } from '../../lib/icons';

export const PasswordResetPage = () => {
  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    });
    if (error) {
      notifications.show({ message: error.message, color: 'red' });
    } else {
      notifications.show({ message: 'Password reset email sent', color: 'green' });
    }
  };

  return (
    <Container size="xs" py="xl">
      <Title order={1} ta="center" mb="xl">
        Reset Password
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
          <Button 
            type="submit" 
            size="md" 
            fullWidth
            leftSection={<IconMail size={18} />}
            mt="md"
          >
            Send Reset Link
          </Button>
          <Anchor component={Link} to="/login" size="sm" ta="center">
            <IconArrowLeft size={14} style={{ marginRight: 4 }} />
            Back to Login
          </Anchor>
        </Stack>
      </form>
    </Container>
  );
};
