import { supabaseAdmin } from '../../lib/supabaseClient';
import { notifications } from '@mantine/notifications';

/**
 * Creates the first admin user. This should only be used once during initial setup.
 * 
 * Options for first admin creation:
 * 1. Use this function from browser console (development only)
 * 2. Create user directly in Supabase Studio
 * 3. Use environment variables for automated setup
 */
export const createFirstAdmin = async (email: string, password: string) => {
  try {
    // Create the user with admin privileges
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
    });

    if (createError) {
      notifications.show({ 
        message: `Failed to create admin: ${createError.message}`, 
        color: 'red' 
      });
      return { error: createError };
    }

    // TODO: Add user to admin role in your users table
    // This depends on your user roles implementation
    
    notifications.show({ 
      message: 'First admin created successfully', 
      color: 'green' 
    });
    
    return { user, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    notifications.show({ 
      message: `Bootstrap failed: ${errorMessage}`, 
      color: 'red' 
    });
    return { error };
  }
};

/**
 * Check if any users exist in the system
 */
export const hasExistingUsers = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      console.error('Failed to check existing users:', error);
      return true; // Assume users exist to be safe
    }
    
    return (data?.users?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error checking users:', error);
    return true; // Assume users exist to be safe
  }
}; 