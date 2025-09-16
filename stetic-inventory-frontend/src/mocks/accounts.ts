import type { Account, Payment, AccountAlert } from '@/types/account';

export const mockAccounts: Account[] = [
  {
    id: '1',
    clientName: 'María García',
    clientPhone: '+34 600 123 456',
    clientEmail: 'maria.garcia@email.com',
    amount: 150.00,
    description: 'Tratamiento facial completo + Limpieza profunda',
    serviceDate: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'pendiente',
    createdDate: '2024-01-15',
    notes: 'Cliente regular, pago mensual',
    isActive: true,
    createdBy: 'Ana López',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    clientName: 'Carlos Ruiz',
    clientPhone: '+34 600 234 567',
    clientEmail: 'carlos.ruiz@email.com',
    amount: 320.00,
    description: 'Paquete de masajes (4 sesiones)',
    serviceDate: '2024-01-10',
    dueDate: '2024-01-25',
    status: 'vencida',
    createdDate: '2024-01-10',
    notes: 'Paquete con descuento, vencido',
    isActive: true,
    createdBy: 'Laura Martín',
    updatedAt: '2024-01-26T00:00:00Z'
  },
  {
    id: '3',
    clientName: 'Sofia Mendez',
    clientPhone: '+34 600 345 678',
    clientEmail: 'sofia.mendez@email.com',
    amount: 200.00,
    description: 'Tratamiento anti-edad',
    serviceDate: '2024-01-08',
    dueDate: '2024-01-22',
    status: 'pagada',
    createdDate: '2024-01-08',
    paidDate: '2024-01-20',
    paidAmount: 200.00,
    paymentMethod: 'tarjeta',
    notes: 'Pagado a tiempo',
    isActive: true,
    createdBy: 'Ana López',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '4',
    clientName: 'Roberto Silva',
    clientPhone: '+34 600 456 789',
    amount: 85.00,
    description: 'Manicure y pedicure',
    serviceDate: '2024-01-20',
    dueDate: '2024-02-05',
    status: 'pendiente',
    createdDate: '2024-01-20',
    notes: 'Primera visita',
    isActive: true,
    createdBy: 'Laura Martín',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '5',
    clientName: 'Elena Morales',
    clientPhone: '+34 600 567 890',
    clientEmail: 'elena.morales@email.com',
    amount: 95.00,
    description: 'Depilación láser - sesión',
    serviceDate: '2024-01-12',
    dueDate: '2024-01-27',
    status: 'vencida',
    createdDate: '2024-01-12',
    notes: 'Sesión 3 de 6',
    isActive: true,
    createdBy: 'Ana López',
    updatedAt: '2024-01-28T00:00:00Z'
  },
  {
    id: '6',
    clientName: 'David Torres',
    clientPhone: '+34 600 678 901',
    amount: 450.00,
    description: 'Paquete completo de tratamientos',
    serviceDate: '2024-01-18',
    dueDate: '2024-02-02',
    status: 'pendiente',
    createdDate: '2024-01-18',
    notes: 'Paquete premium, cliente VIP',
    isActive: true,
    createdBy: 'Laura Martín',
    updatedAt: '2024-01-18T00:00:00Z'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    accountId: '3',
    amount: 200.00,
    paymentDate: '2024-01-20',
    paymentMethod: 'tarjeta',
    notes: 'Pago completo por tarjeta',
    createdBy: 'Ana López',
    createdAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    accountId: '1',
    amount: 75.00,
    paymentDate: '2024-01-22',
    paymentMethod: 'efectivo',
    notes: 'Pago parcial en efectivo',
    createdBy: 'Ana López',
    createdAt: '2024-01-22T16:45:00Z'
  }
];

export const mockAccountAlerts: AccountAlert[] = [
  {
    id: '1',
    type: 'overdue',
    severity: 'high',
    accountId: '2',
    clientName: 'Carlos Ruiz',
    amount: 320.00,
    message: 'Cuenta vencida hace 3 días',
    dueDate: '2024-01-25',
    daysOverdue: 3,
    createdAt: '2024-01-28T00:00:00Z'
  },
  {
    id: '2',
    type: 'overdue',
    severity: 'medium',
    accountId: '5',
    clientName: 'Elena Morales',
    amount: 95.00,
    message: 'Cuenta vencida hace 1 día',
    dueDate: '2024-01-27',
    daysOverdue: 1,
    createdAt: '2024-01-28T00:00:00Z'
  },
  {
    id: '3',
    type: 'due_soon',
    severity: 'medium',
    accountId: '4',
    clientName: 'Roberto Silva',
    amount: 85.00,
    message: 'Vence en 5 días',
    dueDate: '2024-02-05',
    createdAt: '2024-01-31T00:00:00Z'
  },
  {
    id: '4',
    type: 'high_amount',
    severity: 'high',
    accountId: '6',
    clientName: 'David Torres',
    amount: 450.00,
    message: 'Monto alto pendiente',
    dueDate: '2024-02-02',
    createdAt: '2024-01-28T00:00:00Z'
  }
];
