import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Supply, CreateConsumptionData, Service } from '@/types/supply';
import { supplyService } from '@/services/supplies';
import '@/styles/SupplyConsumptionModal.css';

interface SupplyConsumptionModalProps {
  supply: Supply | null;
  isOpen: boolean;
  onClose: () => void;
  onConsume: () => void;
}

const SupplyConsumptionModal: React.FC<SupplyConsumptionModalProps> = ({
  supply,
  isOpen,
  onClose,
  onConsume
}) => {
  const [formData, setFormData] = useState<CreateConsumptionData>({
    supplyId: '',
    serviceId: '',
    serviceName: '',
    quantityUsed: 1,
    clientName: '',
    notes: ''
  });

  const [services, setServices] = useState<Service[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const servicesData = await supplyService.getServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.quantityUsed <= 0) {
      newErrors.quantityUsed = 'La cantidad debe ser mayor a 0';
    }

    if (supply && formData.quantityUsed > supply.currentStock) {
      newErrors.quantityUsed = 'No hay suficiente stock disponible';
    }

    if (!formData.serviceName?.trim() && !formData.serviceId) {
      newErrors.service = 'Debe seleccionar un servicio o especificar uno';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, supply]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !supply) return;

    setIsSubmitting(true);
    
    try {
      await supplyService.createConsumption({
        ...formData,
        supplyId: supply.id
      });
      
      onConsume();
      onClose();
    } catch (error) {
      console.error('Error recording consumption:', error);
      setErrors({ submit: 'Error al registrar el consumo' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, supply, validateForm, onConsume, onClose]);

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

  const handleServiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedService = services.find(s => s.id === e.target.value);
    
    setFormData(prev => ({
      ...prev,
      serviceId: e.target.value,
      serviceName: selectedService ? selectedService.name : ''
    }));

    if (errors.service) {
      setErrors(prev => ({ ...prev, service: '' }));
    }
  }, [services, errors]);

  useEffect(() => {
    if (isOpen && supply) {
      loadServices();
      setFormData({
        supplyId: supply.id,
        serviceId: '',
        serviceName: '',
        quantityUsed: 1,
        clientName: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, supply, loadServices]);

  if (!isOpen || !supply) return null;

  return (
    <div className="supply-consumption-modal-overlay">
      <div className="supply-consumption-modal">
        <div className="modal-header">
          <h3>Registrar Consumo</h3>
          <button className="btn-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="supply-info">
          <h4>{supply.name}</h4>
          <p><strong>Stock disponible:</strong> {supply.currentStock} {supply.unit}</p>
          <p><strong>Costo unitario:</strong> ${supply.unitCost.toFixed(2)}</p>
          <p><strong>Ubicación:</strong> {supply.location}</p>
        </div>

        {isLoading ? (
          <div className="loading-state">Cargando servicios...</div>
        ) : (
          <form onSubmit={handleSubmit} className="consumption-form">
            <div className="form-group">
              <label htmlFor="quantityUsed">Cantidad a Consumir *</label>
              <input
                type="number"
                id="quantityUsed"
                name="quantityUsed"
                value={formData.quantityUsed}
                onChange={handleChange}
                className={errors.quantityUsed ? 'error' : ''}
                min="1"
                max={supply.currentStock}
                step="1"
              />
              {errors.quantityUsed && <span className="error-message">{errors.quantityUsed}</span>}
              <small>Disponible: {supply.currentStock} {supply.unit}</small>
            </div>

            <div className="form-group">
              <label htmlFor="serviceId">Servicio Asociado</label>
              <select
                id="serviceId"
                name="serviceId"
                value={formData.serviceId}
                onChange={handleServiceChange}
                className={errors.service ? 'error' : ''}
              >
                <option value="">Seleccionar servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.category}
                  </option>
                ))}
              </select>
              {errors.service && <span className="error-message">{errors.service}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="serviceName">O especificar servicio</label>
              <input
                type="text"
                id="serviceName"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                placeholder="Nombre del servicio personalizado"
                disabled={!!formData.serviceId}
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientName">Cliente (Opcional)</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Notas adicionales sobre el consumo..."
              />
            </div>

            <div className="consumption-summary">
              <strong>Costo total: ${(formData.quantityUsed * supply.unitCost).toFixed(2)}</strong>
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
        )}
      </div>
    </div>
  );
};

export default SupplyConsumptionModal;
