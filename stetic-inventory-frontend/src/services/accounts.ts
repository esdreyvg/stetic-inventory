import type { 
  Account, 
  Payment,
  CreateAccountData, 
  CreatePaymentData, 
  AccountFilters, 
  AccountAlert,
  AccountSummary,
  ClientSummary,
  AccountStatus
} from '@/types/account';
import { mockAccounts, mockPayments, mockAccountAlerts } from '@/mocks/accounts';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const accountService = {
  // Get all accounts with filters
  async getAccounts(filters?: AccountFilters): Promise<Account[]> {
    await delay(500);
    
    let filteredAccounts = [...mockAccounts];
    
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAccounts = filteredAccounts.filter(account =>
          account.clientName.toLowerCase().includes(searchLower) ||
          account.description.toLowerCase().includes(searchLower) ||
          account.clientPhone?.toLowerCase().includes(searchLower) ||
          account.clientEmail?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.status) {
        filteredAccounts = filteredAccounts.filter(account => account.status === filters.status);
      }
      
      if (filters.dateFrom) {
        filteredAccounts = filteredAccounts.filter(account => 
          account.serviceDate >= filters.dateFrom
        );
      }
      
      if (filters.dateTo) {
        filteredAccounts = filteredAccounts.filter(account => 
          account.serviceDate <= filters.dateTo
        );
      }
      
      if (filters.showOverdue) {
        const today = new Date().toISOString().split('T')[0];
        filteredAccounts = filteredAccounts.filter(account => 
          account.status === 'pendiente' && account.dueDate < today
        );
      }
      
      if (filters.showDueSoon) {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        
        filteredAccounts = filteredAccounts.filter(account => 
          account.status === 'pendiente' && 
          new Date(account.dueDate) <= sevenDaysFromNow &&
          new Date(account.dueDate) >= today
        );
      }
    }
    
    return filteredAccounts.sort((a, b) => 
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  },

  // Get single account by ID
  async getAccount(id: string): Promise<Account | null> {
    await delay(300);
    return mockAccounts.find(account => account.id === id) || null;
  },

  // Create new account
  async createAccount(data: CreateAccountData): Promise<Account> {
    await delay(800);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Determine status based on due date
    let status: AccountStatus = 'pendiente';
    if (data.dueDate < today) {
      status = 'vencida';
    }
    
    const newAccount: Account = {
      id: Date.now().toString(),
      ...data,
      status,
      createdDate: today,
      isActive: true,
      createdBy: 'Usuario Actual', // In real app, get from auth context
      updatedAt: new Date().toISOString()
    };
    
    mockAccounts.push(newAccount);
    return newAccount;
  },

  // Update existing account
  async updateAccount(id: string, data: Partial<CreateAccountData>): Promise<Account> {
    await delay(800);
    
    const index = mockAccounts.findIndex(account => account.id === id);
    if (index === -1) {
      throw new Error('Cuenta no encontrada');
    }
    
    const updatedAccount: Account = {
      ...mockAccounts[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Update status if needed
    const today = new Date().toISOString().split('T')[0];
    if (updatedAccount.status === 'pendiente' && updatedAccount.dueDate < today) {
      updatedAccount.status = 'vencida';
    }
    
    mockAccounts[index] = updatedAccount;
    return updatedAccount;
  },

  // Update account status
  async updateAccountStatus(id: string, status: AccountStatus): Promise<Account> {
    await delay(500);
    
    const index = mockAccounts.findIndex(account => account.id === id);
    if (index === -1) {
      throw new Error('Cuenta no encontrada');
    }
    
    mockAccounts[index] = {
      ...mockAccounts[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return mockAccounts[index];
  },

  // Create payment
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    await delay(800);
    
    const account = mockAccounts.find(a => a.id === data.accountId);
    if (!account) {
      throw new Error('Cuenta no encontrada');
    }
    
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...data,
      paymentDate: new Date().toISOString().split('T')[0],
      createdBy: 'Usuario Actual',
      createdAt: new Date().toISOString()
    };
    
    mockPayments.push(newPayment);
    
    // Update account
    const currentPaid = account.paidAmount || 0;
    const newPaidAmount = currentPaid + data.amount;
    
    if (newPaidAmount >= account.amount) {
      account.status = 'pagada';
      account.paidAmount = account.amount;
      account.paidDate = newPayment.paymentDate;
      account.paymentMethod = data.paymentMethod;
    } else {
      account.paidAmount = newPaidAmount;
    }
    
    account.updatedAt = new Date().toISOString();
    
    return newPayment;
  },

  // Get payments for an account
  async getPayments(accountId?: string): Promise<Payment[]> {
    await delay(300);
    
    if (accountId) {
      return mockPayments.filter(p => p.accountId === accountId);
    }
    
    return [...mockPayments].sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  },

  // Get account alerts
  async getAccountAlerts(): Promise<AccountAlert[]> {
    await delay(300);
    
    // Generate fresh alerts based on current data
    const alerts: AccountAlert[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    mockAccounts.forEach(account => {
      if (account.status === 'pendiente') {
        const dueDate = new Date(account.dueDate);
        
        // Overdue accounts
        if (account.dueDate < today) {
          const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          alerts.push({
            id: `overdue-${account.id}`,
            type: 'overdue',
            severity: daysOverdue > 7 ? 'critical' : daysOverdue > 3 ? 'high' : 'medium',
            accountId: account.id,
            clientName: account.clientName,
            amount: account.amount,
            message: `Cuenta vencida hace ${daysOverdue} días`,
            dueDate: account.dueDate,
            daysOverdue,
            createdAt: now.toISOString()
          });
        }
        // Due soon
        else if (dueDate <= sevenDaysFromNow) {
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          alerts.push({
            id: `due-soon-${account.id}`,
            type: 'due_soon',
            severity: daysUntilDue <= 1 ? 'high' : 'medium',
            accountId: account.id,
            clientName: account.clientName,
            amount: account.amount,
            message: `Vence en ${daysUntilDue} días`,
            dueDate: account.dueDate,
            createdAt: now.toISOString()
          });
        }
        
        // High amount accounts
        if (account.amount >= 300) {
          alerts.push({
            id: `high-amount-${account.id}`,
            type: 'high_amount',
            severity: 'medium',
            accountId: account.id,
            clientName: account.clientName,
            amount: account.amount,
            message: 'Monto alto pendiente',
            dueDate: account.dueDate,
            createdAt: now.toISOString()
          });
        }
      }
    });
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  },

  // Get account summary
  async getAccountSummary(): Promise<AccountSummary> {
    await delay(300);
    
    const pendingAccounts = mockAccounts.filter(a => a.status === 'pendiente');
    const overdueAccounts = mockAccounts.filter(a => a.status === 'vencida');
    const paidAccounts = mockAccounts.filter(a => a.status === 'pagada');
    
    const totalPending = pendingAccounts.reduce((sum, a) => sum + (a.amount - (a.paidAmount || 0)), 0);
    const totalOverdue = overdueAccounts.reduce((sum, a) => sum + (a.amount - (a.paidAmount || 0)), 0);
    const totalPaid = paidAccounts.reduce((sum, a) => sum + a.amount, 0);
    
    const allAmounts = mockAccounts.map(a => a.amount);
    const averageAmount = allAmounts.length > 0 ? allAmounts.reduce((sum, a) => sum + a, 0) / allAmounts.length : 0;
    
    const uniqueClients = new Set(mockAccounts.map(a => a.clientName)).size;
    
    return {
      totalPending,
      totalOverdue,
      totalPaid,
      pendingCount: pendingAccounts.length,
      overdueCount: overdueAccounts.length,
      averageAmount,
      totalClients: uniqueClients
    };
  },

  // Get client summaries
  async getClientSummaries(): Promise<ClientSummary[]> {
    await delay(300);
    
    const clientMap = new Map<string, ClientSummary>();
    
    mockAccounts.forEach(account => {
      const existing = clientMap.get(account.clientName);
      
      if (existing) {
        existing.totalAmount += account.amount;
        existing.accountsCount += 1;
        
        if (account.status === 'pendiente' || account.status === 'vencida') {
          existing.pendingAmount += account.amount - (account.paidAmount || 0);
        }
        
        if (account.status === 'pagada') {
          existing.paidAmount += account.amount;
        }
        
        if (account.serviceDate > existing.lastServiceDate) {
          existing.lastServiceDate = account.serviceDate;
        }
      } else {
        clientMap.set(account.clientName, {
          clientName: account.clientName,
          totalAmount: account.amount,
          pendingAmount: (account.status === 'pendiente' || account.status === 'vencida') 
            ? account.amount - (account.paidAmount || 0) : 0,
          paidAmount: account.status === 'pagada' ? account.amount : (account.paidAmount || 0),
          accountsCount: 1,
          lastServiceDate: account.serviceDate
        });
      }
    });
    
    return Array.from(clientMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }
};
