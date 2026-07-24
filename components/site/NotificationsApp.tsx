'use client';

import { useEffect, useState } from 'react';
import './notifications-app.css';

type NotificationPayload = {
  message?: string;
  type?: 'succes' | 'info' | 'erreur';
};

type NotificationItem = Required<NotificationPayload> & {
  id: number;
};

export default function NotificationsApp({ actif }: { actif: boolean }) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!actif) return;

    function afficher(event: Event) {
      const detail = (event as CustomEvent<NotificationPayload>).detail || {};
      const item: NotificationItem = {
        id: Date.now() + Math.random(),
        message: detail.message || 'Action confirmée',
        type: detail.type || 'succes',
      };
      setItems((actuels) => [...actuels.slice(-2), item]);
      window.setTimeout(() => {
        setItems((actuels) => actuels.filter((n) => n.id !== item.id));
      }, 3600);
    }

    window.addEventListener('nabe:notification', afficher);
    return () => window.removeEventListener('nabe:notification', afficher);
  }, [actif]);

  if (!actif || items.length === 0) return null;

  return (
    <div className="notifications-app" aria-live="polite" aria-atomic="true">
      {items.map((item) => (
        <div key={item.id} className={`notifications-app__item notifications-app__item--${item.type}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
