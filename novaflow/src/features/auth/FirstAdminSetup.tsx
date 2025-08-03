import { TextInput, PasswordInput, Button, Stack, Title, Container, Text, Alert, Loader, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { IconUserPlus, IconMail, IconLock, IconAlertCircle, IconUser } from '../../lib/icons';
import { createFirstAdmin, hasExistingUsers } from './bootstrap';

export const FirstAdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState<boolean | null>(null); // null = checking, true = show, false = hide
  const [checkError, setCheckError] = useState<string | null>(null);

  const form = useForm({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validate: {
      name: (value) => (value.trim().length >= 2 ? null : 'Name must be at least 2 characters'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) => 
        value === values.password ? null : 'Passwords do not match',
    },
  });

  useEffect(() => {
    const checkUsers = async () => {
      try {
        console.log('Checking if users exist...');
        const usersExist = await hasExistingUsers();
        console.log('Users exist:', usersExist);
        setShouldShow(!usersExist);
        setCheckError(null);
      } catch (error) {
        console.error('Error checking users:', error);
        setCheckError(error instanceof Error ? error.message : 'Failed to check users');
        setShouldShow(true); // Show the form if we can't check (safer for first setup)
      }
    };
    checkUsers();
  }, []);

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await createFirstAdmin(values.email, values.password, values.name);
      
      if (result.error) {
        console.error('Failed to create admin:', result.error);
        // Error notification is already shown in createFirstAdmin
      } else {
        // Success! The page should automatically hide after user creation
        setShouldShow(false);
        // Optionally redirect to login page
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking
  if (shouldShow === null) {
    return (
      <Container size="xs" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="md" />
            <Text size="sm" c="dimmed">Checking system status...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Don't show if users already exist
  if (!shouldShow) {
    return (
      <Container size="xs" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Text size="lg" fw={500}>NovaFlow is Ready!</Text>
            <Text size="sm" c="dimmed">Users already exist in the system.</Text>
            <Text size="sm" c="dimmed">
              <a href="/login">Go to Login</a>
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xs" py="xl">
      <Title order={1} ta="center" mb="md">
        Setup First Admin
      </Title>
      <Text size="sm" c="dimmed" ta="center" mb="xl">
        Create the first administrator account for NovaFlow
      </Text>

      {checkError && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Warning" 
          color="yellow" 
          mb="lg"
        >
          Could not verify user status: {checkError}. Proceeding with setup.
        </Alert>
      )}
      
      <Alert 
        icon={<IconAlertCircle size={16} />} 
        title="First Time Setup" 
        color="blue" 
        mb="lg"
      >
        This page only appears when no users exist in the system. 
        After creating the first admin, use the invite system for additional users.
      </Alert>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput 
            label="Full Name" 
            placeholder="John Doe" 
            size="md"
            leftSection={<IconUser size={16} />}
            {...form.getInputProps('name')} 
          />
          <TextInput 
            label="Admin Email" 
            placeholder="admin@company.com" 
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
          <PasswordInput 
            label="Confirm Password" 
            size="md"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('confirmPassword')} 
          />
          <Button 
            type="submit" 
            size="md" 
            fullWidth
            leftSection={<IconUserPlus size={18} />}
            loading={loading}
            mt="md"
          >
            Create Admin Account
          </Button>
        </Stack>
      </form>
    </Container>
  );
}; 