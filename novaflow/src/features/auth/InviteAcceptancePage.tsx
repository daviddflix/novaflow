import { PasswordInput, Button, Stack, Anchor, Title, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { IconKey, IconLock, IconArrowLeft } from '../../lib/icons';

export const SetPasswordPage = () => {
  const form = useForm({
    initialValues: { password: '', confirm: '' },
    validate: {
      password: (v) => (v.length >= 6 ? null : 'Min 6 characters'),
      confirm: (v, values) => (v === values.password ? null : 'Passwords do not match'),
    },
  });

  const handleSubmit = async (values: { password: string }) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      notifications.show({ message: error.message, color: 'red' });
    } else {
      notifications.show({ message: 'Password set', color: 'green' });
    }
  };

  return (
    <Container size="xs" py="xl">
      <Title order={1} ta="center" mb="xl">
        Set Your Password
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <PasswordInput 
            label="Password" 
            size="md"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('password')} 
          />
          <PasswordInput 
            label="Confirm Password" 
            size="md"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('confirm')} 
          />
          <Button 
            type="submit" 
            size="md" 
            fullWidth
            leftSection={<IconKey size={18} />}
            mt="md"
          >
            Set Password
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
