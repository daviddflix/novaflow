import { notifications } from '@mantine/notifications';
import { supabase, supabaseAdmin } from '../../lib/supabaseClient';

/**
 * Sends an invitation email using the Supabase admin client.
 * This must run on a secure server environment; never expose the service
 * role key to the browser.
 */
export const inviteUser = async (email: string) => {
  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
  if (error) {
    notifications.show({ message: error.message, color: 'red' });
  } else {
    notifications.show({ message: 'Invitation sent', color: 'green' });
  }
  return { error };
};

/**
 * Registers a user via magic link.
 */
export const registerWithMagicLink = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    notifications.show({ message: error.message, color: 'red' });
  } else {
    notifications.show({ message: 'Magic link sent', color: 'green' });
  }
  return { error };
};
