import type { Notification } from '@/types/notification';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'expiring',
    productId: 'prod_1',
    productName: 'Crema Anti-edad Vitamin C',
    category: 'Cremas Faciales',
    message: 'Producto vence en 5 días',
    date: '2024-02-10T09:00:00Z',
    isRead: false,
    severity: 'warning'
  },
  {
    id: '2',
    type: 'critical_stock',
    productId: 'prod_2',
    productName: 'Aceite Esencial Lavanda',
    category: 'Aceites',
    message: 'Stock crítico: solo quedan 2 unidades',
    date: '2024-02-09T08:00:00Z',
    isRead: false,
    severity: 'danger'
  },
  {
    id: '3',
    type: 'expiring',
    productId: 'prod_3',
    productName: 'Mascarilla Gold',
    category: 'Mascarillas',
    message: 'Producto vence en 2 días',
    date: '2024-02-08T10:00:00Z',
    isRead: true,
    severity: 'danger'
  }
];
