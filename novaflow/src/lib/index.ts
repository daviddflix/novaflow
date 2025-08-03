// Utilities, constants, and re-exports

export * from './permissions';

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
