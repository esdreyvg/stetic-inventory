import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Asset, CreateAssetData, AssetCategory } from '@/types/asset';
import { assetService } from '@/services/assets';
import '@/styles/AssetForm.css';

interface AssetFormProps {
  asset?: Asset;
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
}

const AssetForm: React.FC<AssetFormProps> = ({
  asset,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateAssetData>({
    name: '',
    category: '',
    description: '',
    cost: 0,
    purchaseDate: '',
    warrantyEndDate: '',
    serialNumber: '',
    supplier: '',
    location: '',
    model: '',
    brand: ''
  });

  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadFormData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesData, suppliersData, locationsData] = await Promise.all([
        assetService.getCategories(),
        assetService.getSuppliers(),
        assetService.getLocations()
      ]);
      
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setLocations(locationsData);

      if (asset) {
        setFormData({
          name: asset.name,
          category: asset.category,
          description: asset.description || '',
          cost: asset.cost,
          purchaseDate: asset.purchaseDate,
          warrantyEndDate: asset.warrantyEndDate || '',
          serialNumber: asset.serialNumber || '',
          supplier: asset.supplier,
          location: asset.location,
          model: asset.model || '',
          brand: asset.brand || ''
        });
      } else {
        setFormData({
          name: '',
          category: categoriesData[0]?.name || '',
          description: '',
          cost: 0,
          purchaseDate: new Date().toISOString().split('T')[0],
          warrantyEndDate: '',
          serialNumber: '',
          supplier: suppliersData[0] || '',
          location: locationsData[0] || '',
          model: '',
          brand: ''
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [asset]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.cost <= 0) {
      newErrors.cost = 'El costo debe ser mayor a 0';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'La fecha de compra es requerida';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'El proveedor es requerido';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (formData.warrantyEndDate && formData.warrantyEndDate <= formData.purchaseDate) {
      newErrors.warrantyEndDate = 'La fecha de garantía debe ser posterior a la compra';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let savedAsset: Asset;
      
      if (asset) {
        savedAsset = await assetService.updateAsset(asset.id, formData);
      } else {
        savedAsset = await assetService.createAsset(formData);
      }
      
      onSave(savedAsset);
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      setErrors({ submit: 'Error al guardar el activo' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, asset, validateForm, onSave, onClose]);

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
    <div className="asset-form-overlay">
      <div className="asset-form-modal">
        <div className="form-header">
          <h3>{asset ? 'Editar Activo' : 'Crear Nuevo Activo'}</h3>
          <button className="btn-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="asset-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre del Activo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Ej: Láser de Depilación IPL Pro"
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

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción del activo..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Marca</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Ej: BeautyTech"
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Modelo</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Ej: IPL Pro 3000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serialNumber">Número de Serie</label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="Ej: IPL2023001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cost">Costo *</label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className={errors.cost ? 'error' : ''}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.cost && <span className="error-message">{errors.cost}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="purchaseDate">Fecha de Compra *</label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className={errors.purchaseDate ? 'error' : ''}
                />
                {errors.purchaseDate && <span className="error-message">{errors.purchaseDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="warrantyEndDate">Fecha de Garantía</label>
                <input
                  type="date"
                  id="warrantyEndDate"
                  name="warrantyEndDate"
                  value={formData.warrantyEndDate}
                  onChange={handleChange}
                  className={errors.warrantyEndDate ? 'error' : ''}
                />
                {errors.warrantyEndDate && <span className="error-message">{errors.warrantyEndDate}</span>}
              </div>
            </div>

            <div className="form-row">
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

              <div className="form-group">
                <label htmlFor="location">Ubicación *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={errors.location ? 'error' : ''}
                  placeholder="Ubicación del activo"
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
              </div>
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
                {isSubmitting ? 'Guardando...' : (asset ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssetForm;
