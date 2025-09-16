import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Account, CreatePaymentData, PaymentMethod } from '@/types/account';
import { accountService } from '@/services/accounts';
import '@/styles/PaymentModal.css';

interface PaymentModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onPayment: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' }
];

const PaymentModal: React.FC<PaymentModalProps> = ({
  account,
  isOpen,
  onClose,
  onPayment
}) => {
  const [formData, setFormData] = useState<CreatePaymentData>({
    accountId: '',
    amount: 0,
    paymentMethod: 'efectivo',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingAmount = account ? account.amount - (account.paidAmount || 0) : 0;

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (formData.amount > remainingAmount) {
      newErrors.amount = 'El monto no puede ser mayor al saldo pendiente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.amount, remainingAmount]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !account) return;

    setIsSubmitting(true);
    
    try {
      await accountService.createPayment({
        ...formData,
        accountId: account.id
      });
      
      onPayment();
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrors({ submit: 'Error al procesar el pago' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, account, validateForm, onPayment, onClose]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleFullPayment = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      amount: remainingAmount
    }));
  }, [remainingAmount]);

  useEffect(() => {
    if (isOpen && account) {
      setFormData({
        accountId: account.id,
        amount: remainingAmount,
        paymentMethod: 'efectivo',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, account, remainingAmount]);

  if (!isOpen || !account) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="modal-header">
          <h3>Registrar Pago</h3>
          <button className="btn-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="account-info">
          <h4>{account.clientName}</h4>
          <p><strong>Descripción:</strong> {account.description}</p>
          <p><strong>Monto total:</strong> ${account.amount.toFixed(2)}</p>
          {account.paidAmount && account.paidAmount > 0 && (
            <p><strong>Ya pagado:</strong> ${account.paidAmount.toFixed(2)}</p>
          )}
          <p><strong>Saldo pendiente:</strong> ${remainingAmount.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Monto a Pagar *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={errors.amount ? 'error' : ''}
                step="0.01"
                min="0"
                max={remainingAmount}
                placeholder="0.00"
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
              <button 
                type="button" 
                className="btn-full-payment"
                onClick={handleFullPayment}
              >
                Pago completo (${remainingAmount.toFixed(2)})
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Método de Pago *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notas del Pago</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>

          {errors.submit && <div className="submit-error">{errors.submit}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
