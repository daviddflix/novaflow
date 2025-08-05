import { PasswordInput, Button, Stack, Anchor, Title, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { IconKey, IconLock, IconArrowLeft } from '../../lib/icons';

export const PasswordResetConfirmPage = () => {
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    initialValues: { password: '', confirm: '' },
    validate: {
      password: (v) => (v.length >= 6 ? null : 'Min 6 characters'),
      confirm: (v, values) => (v === values.password ? null : 'Passwords do not match'),
    },
  });

  useEffect(() => {
    // Check if we have valid auth tokens from the email link
    const checkTokens = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        notifications.show({ 
          message: 'Invalid or expired reset link. Please request a new password reset.', 
          color: 'red' 
        });
        setIsValidToken(false);
      } else {
        setIsValidToken(true);
      }
      setIsLoading(false);
    };

    checkTokens();
  }, []);

  const handleSubmit = async (values: { password: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      
      if (error) {
        notifications.show({ message: error.message, color: 'red' });
      } else {
        notifications.show({ message: 'Password updated successfully!', color: 'green' });
        // Redirect to login page after successful password reset
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      notifications.show({ message: 'An error occurred. Please try again.', color: 'red' });
    }
  };

  if (isLoading) {
    return (
      <Container size="xs" py="xl">
        <Title order={1} ta="center" mb="xl">
          Verifying Reset Link...
        </Title>
      </Container>
    );
  }

  if (!isValidToken) {
    return (
      <Container size="xs" py="xl">
        <Title order={1} ta="center" mb="xl">
          Invalid Reset Link
        </Title>
        <Stack gap="lg">
          <p style={{ textAlign: 'center' }}>
            This password reset link is invalid or has expired.
          </p>
          <Anchor component={Link} to="/reset-password" size="sm" ta="center">
            Request a new password reset
          </Anchor>
          <Anchor component={Link} to="/login" size="sm" ta="center">
            <IconArrowLeft size={14} style={{ marginRight: 4 }} />
            Back to Login
          </Anchor>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xs" py="xl">
      <Title order={1} ta="center" mb="xl">
        Set New Password
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <PasswordInput 
            label="New Password" 
            size="md"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('password')} 
          />
          <PasswordInput 
            label="Confirm New Password" 
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
            Update Password
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