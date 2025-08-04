import { supabase, supabaseAdmin } from '../../lib/supabaseClient';
import { notifications } from '@mantine/notifications';

/**
 * Creates the first admin user using Supabase's built-in auth.signUp() method.
 * After successful signup, creates a default workspace for the user.
 */
export const createFirstAdmin = async (email: string, password: string, name?: string) => {
  try {
    // First check if any users already exist
    const existingUsers = await hasExistingUsers();
    if (existingUsers) {
      const error = new Error('Cannot create admin: users already exist in the system');
      notifications.show({ 
        message: error.message, 
        color: 'red' 
      });
      return { error };
    }

    // Use Supabase's built-in signup method
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    });

    if (signUpError) {
      console.error('Auth signup error:', signUpError);
      notifications.show({ 
        message: `Failed to create admin: ${signUpError.message}`, 
        color: 'red' 
      });
      return { error: signUpError };
    }

    if (!authData.user) {
      const error = new Error('User creation failed: no user returned');
      notifications.show({ 
        message: error.message, 
        color: 'red' 
      });
      return { error };
    }

    // For local development, email confirmation is disabled by default
    // So the user should be immediately available
    
    // Create a default workspace for the new admin
    const { data: workspaceData, error: workspaceError } = await supabaseAdmin
      .from('Workspaces')
      .insert({
        name: 'Default Workspace',
        created_by: authData.user.id
      })
      .select('id')
      .single();

    if (workspaceError) {
      console.error('Workspace creation error:', workspaceError);
      notifications.show({ 
        message: `Admin created but workspace creation failed: ${workspaceError.message}`, 
        color: 'yellow' 
      });
      // Don't return error since the user was created successfully
    }

    notifications.show({ 
      message: 'First admin and workspace created successfully!', 
      color: 'green' 
    });
    
    return { 
      data: { 
        user_id: authData.user.id, 
        workspace_id: workspaceData?.id 
      }, 
      error: null 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Bootstrap failed:', error);
    notifications.show({ 
      message: `Bootstrap failed: ${errorMessage}`, 
      color: 'red' 
    });
    return { error };
  }
};

/**
 * Check if any users exist in the system using the admin client
 */
export const hasExistingUsers = async (): Promise<boolean> => {
  try {
    // Use the admin client to check if any users exist
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
    // Assume users exist to be safe if we can't check
    return true;
  }
}; 