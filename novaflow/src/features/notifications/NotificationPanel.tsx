import React from 'react';
import { useNotification } from '../../context/NotificationContext';

const NotificationPanel: React.FC = () => {
  const { items, markAsRead } = useNotification();

  const uniqueItems = React.useMemo(() => {
    const map = new Map<string, typeof items[number]>();
    for (const n of items) {
      if (!map.has(n.id)) map.set(n.id, n);
    }
    return Array.from(map.values());
  }, [items]);

  if (uniqueItems.length === 0) {
    return <div>No notifications</div>;
  }

  return (
    <ul>
      {uniqueItems.map(n => (
        <li key={n.id} data-testid={`notification-${n.id}`}>
          <span>{n.message}</span>
          {!n.read && (
            <button onClick={() => markAsRead(n.id)}>Mark read</button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default NotificationPanel;
