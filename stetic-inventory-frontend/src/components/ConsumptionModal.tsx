import * as React from 'react';
import { useState } from 'react';
import type { InventoryItem, CreateConsumptionData } from '@/types/inventory';
import { inventoryService } from '@/services/inventory';
import '@/styles/ConsumptionModal.css';

interface ConsumptionModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConsume: () => void;
}

const ConsumptionModal: React.FC<ConsumptionModalProps> = ({
  item,
  isOpen,
  onClose,
  onConsume
}) => {
  const [formData, setFormData] = useState<Omit<CreateConsumptionData, 'inventoryItemId'>>({
    consumedQuantity: 0,
    reason: '',
    serviceType: '',
    clientName: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const maxAvailableML = item.availableQuantity * item.unitSize;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.consumedQuantity || formData.consumedQuantity <= 0) {
      newErrors.consumedQuantity = 'La cantidad debe ser mayor a 0';
    } else if (formData.consumedQuantity > maxAvailableML) {
      newErrors.consumedQuantity = `Cantidad máxima disponible: ${maxAvailableML}ml`;
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'El motivo es requerido';
    }

    if (item.type === 'service' && !formData.serviceType?.trim()) {
      newErrors.serviceType = 'El tipo de servicio es requerido para insumos de servicios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await inventoryService.createConsumption({
        inventoryItemId: item.id,
        ...formData
      });
      
      onConsume();
      onClose();
      
      // Reset form
      setFormData({
        consumedQuantity: 0,
        reason: '',
        serviceType: '',
        clientName: '',
        notes: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error registering consumption:', error);
      setErrors({ submit: 'Error al registrar el consumo' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="consumption-modal-overlay">
      <div className="consumption-modal">
        <div className="modal-header">
          <h3>Registrar Consumo</h3>
          <button className="btn-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="product-info">
          <h4>{item.productName}</h4>
          <p>Código: {item.productCode}</p>
          <p>Disponible: {item.availableQuantity} {item.unit}(s) ({maxAvailableML}ml total)</p>
          <p>Tamaño por unidad: {item.unitSize}ml</p>
        </div>

        <form onSubmit={handleSubmit} className="consumption-form">
          <div className="form-group">
            <label htmlFor="consumedQuantity">Cantidad a Consumir (ml) *</label>
            <input
              type="number"
              id="consumedQuantity"
              name="consumedQuantity"
              value={formData.consumedQuantity}
              onChange={handleChange}
              className={errors.consumedQuantity ? 'error' : ''}
              min="1"
              max={maxAvailableML}
              step="1"
              placeholder="Ej: 50"
            />
            {errors.consumedQuantity && (
              <span className="error-message">{errors.consumedQuantity}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reason">Motivo del Consumo *</label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={errors.reason ? 'error' : ''}
            >
              <option value="">Seleccionar motivo</option>
              <option value="Servicio al cliente">Servicio al cliente</option>
              <option value="Prueba de producto">Prueba de producto</option>
              <option value="Muestra gratuita">Muestra gratuita</option>
              <option value="Uso interno">Uso interno</option>
              <option value="Merma/Desperdicio">Merma/Desperdicio</option>
              <option value="Otros">Otros</option>
            </select>
            {errors.reason && <span className="error-message">{errors.reason}</span>}
          </div>

          {item.type === 'service' && (
            <div className="form-group">
              <label htmlFor="serviceType">Tipo de Servicio *</label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className={errors.serviceType ? 'error' : ''}
              >
                <option value="">Seleccionar servicio</option>
                <option value="Lavado y peinado">Lavado y peinado</option>
                <option value="Corte de cabello">Corte de cabello</option>
                <option value="Coloración">Coloración</option>
                <option value="Tratamiento facial">Tratamiento facial</option>
                <option value="Masaje corporal">Masaje corporal</option>
                <option value="Masaje facial">Masaje facial</option>
                <option value="Manicure">Manicure</option>
                <option value="Pedicure">Pedicure</option>
                <option value="Depilación">Depilación</option>
                <option value="Otros">Otros</option>
              </select>
              {errors.serviceType && <span className="error-message">{errors.serviceType}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="clientName">Nombre del Cliente</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Nombre del cliente (opcional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notas Adicionales</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Observaciones adicionales..."
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
              {isSubmitting ? 'Registrando...' : 'Registrar Consumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumptionModal;
