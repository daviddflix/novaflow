import { PasswordInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { supabase } from '../../lib/supabaseClient';

export const InviteAcceptancePage = () => {
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
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <PasswordInput label="Password" {...form.getInputProps('password')} />
        <PasswordInput label="Confirm Password" {...form.getInputProps('confirm')} />
        <Button type="submit">Accept Invite</Button>
      </Stack>
    </form>
  );
};
