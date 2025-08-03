import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

// Types
export interface NotificationItem {
  id: string;
  type: 'mention' | 'task_assignment' | string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface NotifyInput {
  id: string;
  type?: NotificationItem['type'];
  message?: string;
  createdAt?: Date;
}

interface NotificationContextValue {
  items: NotificationItem[];
  notify: (input: NotifyInput) => void;
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function defaultMessage(type?: string): string {
  switch (type) {
    case 'mention':
      return 'You were mentioned.';
    case 'task_assignment':
      return 'You were assigned a task.';
    default:
      return 'You have a new notification.';
  }
}

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const notify = useCallback((input: NotifyInput) => {
    setItems(prev => {
      if (prev.some(n => n.id === input.id)) return prev; // dedupe
      const item: NotificationItem = {
        id: input.id,
        type: input.type || 'general',
        message: input.message || defaultMessage(input.type),
        read: false,
        createdAt: input.createdAt || new Date(),
      };
      return [item, ...prev];
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  useEffect(() => {
    const handleMention = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      notify({
        id: detail.id,
        type: 'mention',
        message: detail.user ? `${detail.user} mentioned you` : undefined,
      });
    };
    const handleAssignment = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      notify({
        id: detail.id,
        type: 'task_assignment',
        message: detail.task ? `You were assigned to ${detail.task}` : undefined,
      });
    };
    window.addEventListener('mention', handleMention as EventListener);
    window.addEventListener('task-assignment', handleAssignment as EventListener);
    return () => {
      window.removeEventListener('mention', handleMention as EventListener);
      window.removeEventListener('task-assignment', handleAssignment as EventListener);
    };
  }, [notify]);

  return (
    <NotificationContext.Provider value={{ items, notify, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
}

