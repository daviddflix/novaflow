// Utilities, constants, and permission logic

// Permission utilities will be implemented here
interface UserLike {
  role: string;
}

export const permissions = {
  canEditProject: (user: UserLike) => {
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
