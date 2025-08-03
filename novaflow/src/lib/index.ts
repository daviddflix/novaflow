// Utilities, constants, and permission logic

export { logActivity } from './activity';

// Permission utilities will be implemented here

/**
 * Basic representation of a user used for permission checks.
 * Additional fields can be added as needed.
 */
interface User {
  role: string;
}

/**
 * Placeholder workspace type.
 * The workspace is currently unused but kept for API compatibility with
 * future permission helpers.
 */
interface Workspace {
  id?: string;
}

export const permissions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canEditProject: (user: User, _workspace: Workspace) => {
    return user.role === 'admin' || user.role === 'member';
  },
  // More permission functions will be added
};

// Constants
export const APP_CONSTANTS = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
  TASK_STATUSES: ['Todo', 'In Progress', 'Done'] as const,
  USER_ROLES: ['admin', 'member', 'viewer'] as const,
};

// Utility functions will be added here
export const utils = {
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
  // More utility functions will be added
};
