export type NotificationType = 'expiring' | 'critical_stock';

export interface Notification {
  id: string;
  type: NotificationType;
  productId: string;
  productName: string;
  category: string;
  message: string;
  date: string;
  isRead: boolean;
  severity: 'info' | 'warning' | 'danger';
}
