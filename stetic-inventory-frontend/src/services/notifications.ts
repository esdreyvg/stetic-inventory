import type { Notification } from '@/types/notification';
import { mockNotifications } from '@/mocks/notifications';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    await delay(300);
    return [...mockNotifications];
  },
  async markAsRead(id: string): Promise<void> {
    await delay(200);
    const notif = mockNotifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
  },
  async markAllAsRead(): Promise<void> {
    await delay(200);
    mockNotifications.forEach(n => n.isRead = true);
  }
};
