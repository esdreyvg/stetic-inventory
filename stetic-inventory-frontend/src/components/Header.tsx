import * as React from 'react';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '@/services/notifications';
import NotificationCenter from '@/components/NotificationCenter';
import '@/styles/Header.css';

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getNotifications().then(list => {
      setUnreadCount(list.filter(n => !n.isRead).length);
    });
  }, [showNotifications]);

  return (
    <header className="bg-white shadow px-4 py-2 flex items-center justify-between">
      <span className="text-xl font-bold text-blue-700">Estética & Spa Inventario</span>
      <div className="header-actions">
        <button className="notification-bell" onClick={() => setShowNotifications(true)}>
          <Bell size={22} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
        <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
          Salir
        </button>
      </div>
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </header>
  );
};

export default Header;