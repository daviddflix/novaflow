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
export const createFirstAdmin = async (email: string, password: string, name?: string) => {
  try {
    // Create the user with admin privileges and store name in metadata
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        name: name || email.split('@')[0] // Use provided name or extract from email
      }
    });

    if (createError) {
      notifications.show({ 
        message: `Failed to create admin: ${createError.message}`, 
        color: 'red' 
      });
      return { error: createError };
    }

    // Create a default workspace for the first admin
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('Workspaces')
      .insert({
        name: 'Default Workspace',
        created_by: user.user?.id
      })
      .select()
      .single();

    if (workspaceError) {
      notifications.show({ 
        message: `Failed to create workspace: ${workspaceError.message}`, 
        color: 'red' 
      });
      return { error: workspaceError };
    }

    // The WorkspaceMembers entry is created automatically by the trigger
    
    notifications.show({ 
      message: 'First admin and workspace created successfully', 
      color: 'green' 
    });
    
    return { user, workspace, error: null };
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