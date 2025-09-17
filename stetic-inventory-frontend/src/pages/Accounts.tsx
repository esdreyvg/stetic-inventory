import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Account, AccountFilters, AccountAlert, AccountSummary, ClientSummary, CreatePaymentData } from '@/types/account';
import { accountService } from '@/services/accounts';
import AccountForm from '@/components/AccountForm';
import PaymentModal from '@/components/PaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Accounts.css';

const Accounts: React.FC = () => {
  const { hasRole } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [alerts, setAlerts] = useState<AccountAlert[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [clientSummaries, setClientSummaries] = useState<ClientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccountForPayment, setSelectedAccountForPayment] = useState<Account | null>(null);
  const [showClientReport, setShowClientReport] = useState(false);
  
  const [filters, setFilters] = useState<AccountFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    showOverdue: false,
    showDueSoon: false
  });

  const canManageAccounts = useMemo(() => hasRole(['administrador', 'gerente']), [hasRole]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [accountsData, alertsData, summaryData, clientData] = await Promise.all([
        accountService.getAccounts(),
        accountService.getAccountAlerts(),
        accountService.getAccountSummary(),
        accountService.getClientSummaries()
      ]);
      
      setAccounts(accountsData);
      setAlerts(alertsData);
      setSummary(summaryData);
      setClientSummaries(clientData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...accounts];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(account =>
        account.clientName.toLowerCase().includes(searchLower) ||
        account.description.toLowerCase().includes(searchLower) ||
        account.clientPhone?.toLowerCase().includes(searchLower) ||
        account.clientEmail?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(account => account.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(account => account.serviceDate >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(account => account.serviceDate <= filters.dateTo);
    }

    if (filters.showOverdue) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(account => 
        account.status === 'pendiente' && account.dueDate < today
      );
    }

    if (filters.showDueSoon) {
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      filtered = filtered.filter(account => 
        account.status === 'pendiente' && 
        new Date(account.dueDate) <= sevenDaysFromNow &&
        new Date(account.dueDate) >= today
      );
    }

    setFilteredAccounts(filtered);
  }, [accounts, filters]);

  const handleCreateAccount = useCallback(() => {
    setEditingAccount(undefined);
    setShowForm(true);
  }, []);

  const handleEditAccount = useCallback((account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  }, []);

  const handleSaveAccount = useCallback((savedAccount: Account) => {
    if (editingAccount) {
      setAccounts(prev => prev.map(a => 
        a.id === savedAccount.id ? savedAccount : a
      ));
    } else {
      setAccounts(prev => [...prev, savedAccount]);
    }
    // Reload summary data
    loadInitialData();
  }, [editingAccount, loadInitialData]);

  const handlePayment = useCallback((account: Account) => {
    setSelectedAccountForPayment(account);
    setShowPaymentModal(true);
  }, []);

  const handlePaymentComplete = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleFilterChange = useCallback((key: keyof AccountFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      showOverdue: false,
      showDueSoon: false
    });
  }, []);

  const getStatusColor = (status: Account['status']) => {
    switch (status) {
      case 'pendiente': return '#f39c12';
      case 'vencida': return '#e74c3c';
      case 'pagada': return '#27ae60';
      case 'cancelada': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: Account['status']) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'vencida': return 'Vencida';
      case 'pagada': return 'Pagada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getAlertSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'alert-critical';
      case 'high': return 'alert-high';
      case 'medium': return 'alert-medium';
      case 'low': return 'alert-low';
      default: return 'alert-low';
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (isLoading) {
    return (
      <div className="accounts-container">
        <div className="loading-state">Cargando cuentas por cobrar...</div>
      </div>
    );
  }

  return (
    <div className="accounts-container">
      <div className="accounts-content">
        <div className="accounts-header">
          <h2>Cuentas por Cobrar</h2>
          <div className="header-actions">
            <button 
              className="btn-secondary"
              onClick={() => setShowClientReport(!showClientReport)}
            >
              {showClientReport ? 'Ocultar' : 'Ver'} Reporte por Cliente
            </button>
            {canManageAccounts && (
              <button className="btn-primary" onClick={handleCreateAccount}>
                Nueva Cuenta
              </button>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="alerts-section">
            <h3>Alertas de Cuentas</h3>
            <div className="alerts-list">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`alert ${getAlertSeverityClass(alert.severity)}`}>
                  <span className="alert-icon">
                    {alert.type === 'overdue' && '⚠️'}
                    {alert.type === 'due_soon' && '⏰'}
                    {alert.type === 'high_amount' && '💰'}
                  </span>
                  <div className="alert-content">
                    <strong>{alert.clientName}</strong>
                    <span>{alert.message} - ${alert.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="accounts-stats">
            <div className="stat-card pending">
              <span className="stat-number">${summary.totalPending.toFixed(2)}</span>
              <span className="stat-label">Total Pendiente</span>
              <span className="stat-count">{summary.pendingCount} cuentas</span>
            </div>
            <div className="stat-card overdue">
              <span className="stat-number">${summary.totalOverdue.toFixed(2)}</span>
              <span className="stat-label">Total Vencido</span>
              <span className="stat-count">{summary.overdueCount} cuentas</span>
            </div>
            <div className="stat-card paid">
              <span className="stat-number">${summary.totalPaid.toFixed(2)}</span>
              <span className="stat-label">Total Pagado</span>
            </div>
            <div className="stat-card clients">
              <span className="stat-number">{summary.totalClients}</span>
              <span className="stat-label">Clientes</span>
              <span className="stat-count">Promedio: ${summary.averageAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Client Report */}
        {showClientReport && (
          <div className="client-report">
            <h3>Reporte por Cliente</h3>
            <div className="client-report-table">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Pendiente</th>
                    <th>Pagado</th>
                    <th>Cuentas</th>
                    <th>Último Servicio</th>
                  </tr>
                </thead>
                <tbody>
                  {clientSummaries.map(client => (
                    <tr key={client.clientName}>
                      <td>{client.clientName}</td>
                      <td className="amount">${client.totalAmount.toFixed(2)}</td>
                      <td className="amount pending">${client.pendingAmount.toFixed(2)}</td>
                      <td className="amount paid">${client.paidAmount.toFixed(2)}</td>
                      <td>{client.accountsCount}</td>
                      <td>{new Date(client.lastServiceDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="accounts-filters">
          <div className="filter-row">
            <div className="search-group">
              <input
                type="text"
                placeholder="Buscar por cliente, descripción, teléfono o email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="vencida">Vencida</option>
                <option value="pagada">Pagada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="filter-group">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="filter-input"
                placeholder="Desde"
              />
            </div>

            <div className="filter-group">
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="filter-input"
                placeholder="Hasta"
              />
            </div>

            <div className="toggle-filters">
              <label className="toggle-filter">
                <input
                  type="checkbox"
                  checked={filters.showOverdue}
                  onChange={(e) => handleFilterChange('showOverdue', e.target.checked)}
                />
                Solo vencidas
              </label>

              <label className="toggle-filter">
                <input
                  type="checkbox"
                  checked={filters.showDueSoon}
                  onChange={(e) => handleFilterChange('showDueSoon', e.target.checked)}
                />
                Vencen pronto
              </label>
            </div>

            <button className="btn-secondary" onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="accounts-table">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha Servicio</th>
                <th>Vencimiento</th>
                <th>Días</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(account => {
                const daysUntilDue = getDaysUntilDue(account.dueDate);
                const remainingAmount = account.amount - (account.paidAmount || 0);
                
                return (
                  <tr key={account.id} className={account.status}>
                    <td>
                      <div className="client-info">
                        <span className="client-name">{account.clientName}</span>
                        {account.clientPhone && (
                          <span className="client-contact">{account.clientPhone}</span>
                        )}
                        {account.clientEmail && (
                          <span className="client-contact">{account.clientEmail}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="description-info">
                        <span className="description">{account.description}</span>
                        {account.notes && (
                          <span className="notes">{account.notes}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="amount-info">
                        <span className="total-amount">${account.amount.toFixed(2)}</span>
                        {account.paidAmount && account.paidAmount > 0 && (
                          <>
                            <span className="paid-amount">Pagado: ${account.paidAmount.toFixed(2)}</span>
                            <span className="remaining-amount">Resta: ${remainingAmount.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(account.status) }}
                      >
                        {getStatusText(account.status)}
                      </span>
                    </td>
                    <td>{new Date(account.serviceDate).toLocaleDateString()}</td>
                    <td>
                      <div className="due-date-info">
                        <span>{new Date(account.dueDate).toLocaleDateString()}</span>
                        {account.status === 'vencida' && (
                          <span className="overdue-warning">Vencida</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`days-until-due ${
                        daysUntilDue < 0 ? 'overdue' : 
                        daysUntilDue <= 3 ? 'due-soon' : 
                        daysUntilDue <= 7 ? 'due-week' : ''
                      }`}>
                        {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d vencida` : 
                         daysUntilDue === 0 ? 'Hoy' : 
                         `${daysUntilDue}d`}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {(account.status === 'pendiente' || account.status === 'vencida') && (
                          <button
                            className="btn-pay"
                            onClick={() => handlePayment(account)}
                          >
                            Pagar
                          </button>
                        )}
                        {canManageAccounts && (
                          <button
                            className="btn-edit"
                            onClick={() => handleEditAccount(account)}
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAccounts.length === 0 && (
            <div className="no-accounts">
              <p>No se encontraron cuentas que coincidan con los filtros.</p>
            </div>
          )}
        </div>

        <AccountForm
          account={editingAccount}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSaveAccount}
        />

        <PaymentModal
          account={selectedAccountForPayment}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPayment={handlePaymentComplete}
        />
      </div>
    </div>
  );
};

export default Accounts;
