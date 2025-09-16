import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/types/notification';
import { notificationService } from '@/services/notifications';
import '@/styles/NotificationCenter.css';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen, loadNotifications]);

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center-modal" onClick={e => e.stopPropagation()}>
        <div className="notification-center-header">
          <h3>Centro de Notificaciones</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="notification-center-actions">
          <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
            Marcar todas como leídas
          </button>
        </div>
        <div className="notification-list">
          {isLoading ? (
            <div className="loading-state">Cargando...</div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">No hay notificaciones.</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.severity} ${n.isRead ? 'read' : 'unread'}`}>
                <div className="notification-main">
                  <span className="notification-title">
                    {n.type === 'expiring' ? '⏰' : '⚠️'} {n.productName}
                  </span>
                  <span className="notification-category">{n.category}</span>
                  <span className="notification-message">{n.message}</span>
                </div>
                <div className="notification-meta">
                  <span className="notification-date">{new Date(n.date).toLocaleString()}</span>
                  {!n.isRead && (
                    <button className="btn-mark-read" onClick={() => handleMarkAsRead(n.id)}>
                      Marcar como leída
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
