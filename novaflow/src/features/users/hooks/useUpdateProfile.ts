import { useCallback } from 'react';
import { supabase } from '../../../services';

export interface ProfileUpdates {
  name?: string;
  avatar_url?: string;
}

/**
 * Hook exposing a profile update helper.
 * Wraps `supabase.from('Users').update` with error handling.
 */
export function useUpdateProfile() {
  const updateProfile = useCallback(async (userId: string, updates: ProfileUpdates) => {
    const { error } = await supabase.from('Users').update(updates).eq('id', userId);
    if (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  }, []);

  return { updateProfile };
}
