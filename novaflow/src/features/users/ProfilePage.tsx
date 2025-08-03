import { useEffect, useState } from 'react';
import { Avatar, Button, FileInput, Stack, Text, TextInput } from '@mantine/core';
import { supabase } from '../../services';
import { useUpdateProfile } from './hooks/useUpdateProfile';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface ProfilePageProps {
  userId: string;
}

/**
 * Profile page component. Allows the current user to update their name and avatar.
 * Other workspace members get a read-only view intended for admins.
 */
export function ProfilePage({ userId }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { updateProfile } = useUpdateProfile();

  useEffect(() => {
    // Fetch profile data
    supabase
      .from('Users')
      .select('id, name, avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch profile', error);
        } else if (data) {
          setProfile(data);
        }
      });

    // Determine current user
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, [userId]);

  const handleAvatarChange = async (file: File | null) => {
    if (!profile || !file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('Invalid file type');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      console.error('File too large');
      return;
    }
    const ext = file.name.split('.').pop();
    const filePath = `${profile.id}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
    });
    if (error) {
      console.error('Avatar upload failed', error);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setProfile({ ...profile, avatar_url: data.publicUrl });
  };

  const handleSave = async () => {
    if (!profile) return;
    await updateProfile(profile.id, {
      name: profile.name,
      avatar_url: profile.avatar_url ?? undefined,
    });
  };

  if (!profile) {
    return <Text>Loading...</Text>;
  }

  const isCurrentUser = currentUserId === profile.id;

  if (!isCurrentUser) {
    // Read-only admin view
    return (
      <Stack>
        <Avatar src={profile.avatar_url ?? undefined} size={120} />
        <Text fw={500}>{profile.name}</Text>
        <Text c="dimmed">Admin-only view</Text>
      </Stack>
    );
  }

  return (
    <Stack>
      <Avatar src={profile.avatar_url ?? undefined} size={120} />
      <FileInput
        accept={ALLOWED_TYPES.join(',')}
        label="Avatar"
        onChange={handleAvatarChange}
      />
      <TextInput
        label="Name"
        value={profile.name}
        onChange={(e) => setProfile({ ...profile, name: e.currentTarget.value })}
      />
      <Button onClick={handleSave}>Save</Button>
    </Stack>
  );
}

export default ProfilePage;
