import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Supply, CreateSupplyData, SupplyCategory, SupplyType } from '@/types/supply';
import { supplyService } from '@/services/supplies';
import '@/styles/SupplyForm.css';

interface SupplyFormProps {
  supply?: Supply;
  isOpen: boolean;
  onClose: () => void;
  onSave: (supply: Supply) => void;
}

const SUPPLY_TYPES: { value: SupplyType; label: string }[] = [
  { value: 'consumible', label: 'Consumible' },
  { value: 'reutilizable', label: 'Reutilizable' },
  { value: 'desechable', label: 'Desechable' }
];

const SUPPLY_UNITS = [
  'unidad', 'paquete', 'caja', 'rollo', 'litro', 'ml', 'kg', 'g', 'par'
];

const SupplyForm: React.FC<SupplyFormProps> = ({
  supply,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateSupplyData>({
    name: '',
    category: '',
    type: 'consumible',
    description: '',
    currentStock: 0,
    minStock: 0,
    unitCost: 0,
    unit: 'unidad',
    supplier: '',
    lastPurchaseDate: '',
    expirationDate: '',
    location: ''
  });

  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadFormData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesData, suppliersData, locationsData] = await Promise.all([
        supplyService.getCategories(),
        supplyService.getSuppliers(),
        supplyService.getLocations()
      ]);
      
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setLocations(locationsData);

      if (supply) {
        setFormData({
          name: supply.name,
          category: supply.category,
          type: supply.type,
          description: supply.description || '',
          currentStock: supply.currentStock,
          minStock: supply.minStock,
          unitCost: supply.unitCost,
          unit: supply.unit,
          supplier: supply.supplier,
          lastPurchaseDate: supply.lastPurchaseDate,
          expirationDate: supply.expirationDate || '',
          location: supply.location
        });
      } else {
        setFormData({
          name: '',
          category: categoriesData[0]?.name || '',
          type: 'consumible',
          description: '',
          currentStock: 0,
          minStock: 0,
          unitCost: 0,
          unit: 'unidad',
          supplier: suppliersData[0] || '',
          lastPurchaseDate: new Date().toISOString().split('T')[0],
          expirationDate: '',
          location: locationsData[0] || ''
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supply]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.currentStock < 0) {
      newErrors.currentStock = 'El stock no puede ser negativo';
    }

    if (formData.minStock < 0) {
      newErrors.minStock = 'El stock mínimo no puede ser negativo';
    }

    if (formData.unitCost <= 0) {
      newErrors.unitCost = 'El costo unitario debe ser mayor a 0';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'El proveedor es requerido';
    }

    if (!formData.lastPurchaseDate) {
      newErrors.lastPurchaseDate = 'La fecha de compra es requerida';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (formData.expirationDate && formData.expirationDate <= formData.lastPurchaseDate) {
      newErrors.expirationDate = 'La fecha de vencimiento debe ser posterior a la compra';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let savedSupply: Supply;
      
      if (supply) {
        savedSupply = await supplyService.updateSupply(supply.id, formData);
      } else {
        savedSupply = await supplyService.createSupply(formData);
      }
      
      onSave(savedSupply);
      onClose();
    } catch (error) {
      console.error('Error saving supply:', error);
      setErrors({ submit: 'Error al guardar el insumo' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, supply, validateForm, onSave, onClose]);

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

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen, loadFormData]);

  if (!isOpen) return null;

  return (
    <div className="supply-form-overlay">
      <div className="supply-form-modal">
        <div className="form-header">
          <h3>{supply ? 'Editar Insumo' : 'Crear Nuevo Insumo'}</h3>
          <button className="btn-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="supply-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre del Insumo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Ej: Guantes de Nitrilo Talla M"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoría *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Tipo</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {SUPPLY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unidad</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  {SUPPLY_UNITS.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción del insumo..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currentStock">Stock Actual</label>
                <input
                  type="number"
                  id="currentStock"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleChange}
                  className={errors.currentStock ? 'error' : ''}
                  min="0"
                />
                {errors.currentStock && <span className="error-message">{errors.currentStock}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="minStock">Stock Mínimo</label>
                <input
                  type="number"
                  id="minStock"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  className={errors.minStock ? 'error' : ''}
                  min="0"
                />
                {errors.minStock && <span className="error-message">{errors.minStock}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="unitCost">Costo Unitario *</label>
                <input
                  type="number"
                  id="unitCost"
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleChange}
                  className={errors.unitCost ? 'error' : ''}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.unitCost && <span className="error-message">{errors.unitCost}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="supplier">Proveedor *</label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className={errors.supplier ? 'error' : ''}
                  placeholder="Nombre del proveedor"
                />
                {errors.supplier && <span className="error-message">{errors.supplier}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lastPurchaseDate">Fecha de Compra *</label>
                <input
                  type="date"
                  id="lastPurchaseDate"
                  name="lastPurchaseDate"
                  value={formData.lastPurchaseDate}
                  onChange={handleChange}
                  className={errors.lastPurchaseDate ? 'error' : ''}
                />
                {errors.lastPurchaseDate && <span className="error-message">{errors.lastPurchaseDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="expirationDate">Fecha de Vencimiento</label>
                <input
                  type="date"
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  className={errors.expirationDate ? 'error' : ''}
                />
                {errors.expirationDate && <span className="error-message">{errors.expirationDate}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Ubicación *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'error' : ''}
                placeholder="Ubicación del insumo"
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
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
                {isSubmitting ? 'Guardando...' : (supply ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupplyForm;
