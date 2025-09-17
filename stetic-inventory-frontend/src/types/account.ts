export type AccountStatus = 'pendiente' | 'vencida' | 'pagada' | 'cancelada';
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';

export interface Account {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  amount: number;
  description: string;
  serviceDate: string;
  dueDate: string;
  status: AccountStatus;
  createdDate: string;
  paidDate?: string;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  isActive: boolean;
  createdBy: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  accountId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateAccountData {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  amount: number;
  description: string;
  serviceDate: string;
  dueDate: string;
  notes?: string;
}

export interface CreatePaymentData {
  accountId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface AccountFilters {
  search: string;
  status: AccountStatus | '';
  dateFrom: string;
  dateTo: string;
  showOverdue: boolean;
  showDueSoon: boolean;
}

export interface AccountAlert {
  id: string;
  type: 'overdue' | 'due_soon' | 'high_amount';
  severity: 'low' | 'medium' | 'high' | 'critical';
  accountId: string;
  clientName: string;
  amount: number;
  message: string;
  dueDate: string;
  daysOverdue?: number;
  createdAt: string;
}

export interface AccountSummary {
  totalPending: number;
  totalOverdue: number;
  totalPaid: number;
  pendingCount: number;
  overdueCount: number;
  averageAmount: number;
  totalClients: number;
}

export interface ClientSummary {
  clientName: string;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  accountsCount: number;
  lastServiceDate: string;
}
