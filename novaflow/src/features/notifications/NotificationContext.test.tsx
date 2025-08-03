import { renderHook, act, render, screen } from '@testing-library/react';
import React from 'react';
import { NotificationProvider, useNotification } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

describe('NotificationContext', () => {
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  it('deduplicates notifications', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.notify({ id: '1', message: 'Hello' });
      result.current.notify({ id: '1', message: 'Duplicate' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].message).toBe('Hello');
  });

  it('marks notifications as read', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.notify({ id: 'read-test', message: 'Mark me' });
      result.current.markAsRead('read-test');
    });

    expect(result.current.items[0].read).toBe(true);
  });

  it('subscribes to mention events and handles missing data', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      window.dispatchEvent(
        new CustomEvent('mention', { detail: { id: 'm1', user: 'Alice' } })
      );
      window.dispatchEvent(new CustomEvent('mention', { detail: { id: 'm2' } }));
    });

    const m1 = result.current.items.find(n => n.id === 'm1');
    const m2 = result.current.items.find(n => n.id === 'm2');
    expect(m1?.message).toContain('Alice');
    expect(m2?.message).toBe('You were mentioned.');
  });
});

describe('NotificationPanel', () => {
  it('renders unique notifications', () => {
    render(
      <NotificationProvider>
        <NotificationPanel />
      </NotificationProvider>
    );

    act(() => {
      window.dispatchEvent(new CustomEvent('mention', { detail: { id: 'p1', user: 'Bob' } }));
      window.dispatchEvent(new CustomEvent('mention', { detail: { id: 'p1', user: 'Bob' } }));
    });

    expect(screen.getAllByTestId('notification-p1').length).toBe(1);
  });
});
