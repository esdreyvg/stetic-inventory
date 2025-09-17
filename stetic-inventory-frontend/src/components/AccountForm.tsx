import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Account, CreateAccountData } from '@/types/account';
import { accountService } from '@/services/accounts';
import '@/styles/AccountForm.css';

interface AccountFormProps {
  account?: Account;
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
}

const AccountForm: React.FC<AccountFormProps> = ({
  account,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateAccountData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    amount: 0,
    description: '',
    serviceDate: '',
    dueDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'El nombre del cliente es requerido';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.serviceDate) {
      newErrors.serviceDate = 'La fecha de servicio es requerida';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida';
    }

    if (formData.dueDate && formData.serviceDate && formData.dueDate < formData.serviceDate) {
      newErrors.dueDate = 'La fecha de vencimiento debe ser posterior al servicio';
    }

    if (formData.clientEmail && !/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let savedAccount: Account;
      
      if (account) {
        savedAccount = await accountService.updateAccount(account.id, formData);
      } else {
        savedAccount = await accountService.createAccount(formData);
      }
      
      onSave(savedAccount);
      onClose();
    } catch (error) {
      console.error('Error saving account:', error);
      setErrors({ submit: 'Error al guardar la cuenta' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, account, validateForm, onSave, onClose]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setFormData({
          clientName: account.clientName,
          clientPhone: account.clientPhone || '',
          clientEmail: account.clientEmail || '',
          amount: account.amount,
          description: account.description,
          serviceDate: account.serviceDate,
          dueDate: account.dueDate,
          notes: account.notes || ''
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        
        setFormData({
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          amount: 0,
          description: '',
          serviceDate: today,
          dueDate: dueDate.toISOString().split('T')[0],
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, account]);

  if (!isOpen) return null;

  return (
    <div className="account-form-overlay">
      <div className="account-form-modal">
        <div className="form-header">
          <h3>{account ? 'Editar Cuenta' : 'Nueva Cuenta por Cobrar'}</h3>
          <button className="btn-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientName">Nombre del Cliente *</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className={errors.clientName ? 'error' : ''}
                placeholder="Nombre completo del cliente"
              />
              {errors.clientName && <span className="error-message">{errors.clientName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Monto *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={errors.amount ? 'error' : ''}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientPhone">Teléfono</label>
              <input
                type="tel"
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                placeholder="+34 600 123 456"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientEmail">Email</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                className={errors.clientEmail ? 'error' : ''}
                placeholder="cliente@email.com"
              />
              {errors.clientEmail && <span className="error-message">{errors.clientEmail}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción del Servicio *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              rows={3}
              placeholder="Descripción detallada del servicio realizado..."
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="serviceDate">Fecha del Servicio *</label>
              <input
                type="date"
                id="serviceDate"
                name="serviceDate"
                value={formData.serviceDate}
                onChange={handleChange}
                className={errors.serviceDate ? 'error' : ''}
              />
              {errors.serviceDate && <span className="error-message">{errors.serviceDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Fecha de Vencimiento *</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? 'error' : ''}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notas Adicionales</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Notas adicionales sobre la cuenta..."
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
              {isSubmitting ? 'Guardando...' : (account ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
