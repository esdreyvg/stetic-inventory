import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Product, CreateProductData, ProductCategory, Supplier, UnitMeasure } from '@/types/product';
import { productService } from '@/services/products';
import '@/styles/ProductForm.css';

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const UNIT_MEASURES: UnitMeasure[] = [
  'unidad', 'kg', 'g', 'litro', 'ml', 'metro', 'cm', 'caja', 'paquete'
];

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    code: '',
    category: '',
    unit: 'unidad',
    price: 0,
    supplier: '',
    description: '',
    stock: 0,
    minStock: 1
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateProductData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFormData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesData, suppliersData] = await Promise.all([
        productService.getCategories(),
        productService.getSuppliers()
      ]);
      
      setCategories(categoriesData);
      setSuppliers(suppliersData);

      if (product) {
        setFormData({
          name: product.name,
          code: product.code,
          category: product.category,
          unit: product.unit as UnitMeasure,
          price: product.price,
          supplier: product.supplier,
          description: product.description || '',
          stock: product.stock,
          minStock: product.minStock
        });
      } else {
        setFormData({
          name: '',
          code: '',
          category: categoriesData[0]?.name || '',
          unit: 'unidad',
          price: 0,
          supplier: suppliersData[0]?.name || '',
          description: '',
          stock: 0,
          minStock: 1
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen, loadFormData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateProductData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.supplier) {
      newErrors.supplier = 'El proveedor es requerido';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    if (formData.minStock < 0) {
      newErrors.minStock = 'El stock mínimo no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let savedProduct: Product;
      
      if (product) {
        savedProduct = await productService.updateProduct(product.id, formData);
      } else {
        savedProduct = await productService.createProduct(formData);
      }
      
      onSave(savedProduct);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof CreateProductData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="product-form-overlay">
      <div className="product-form-modal">
        <div className="form-header">
          <h3>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
          <button className="btn-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre del Producto *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Ej: Crema Hidratante Facial"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="code">Código *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={errors.code ? 'error' : ''}
                  placeholder="Ej: CHF001"
                />
                {errors.code && <span className="error-message">{errors.code}</span>}
              </div>
            </div>

            <div className="form-row">
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

              <div className="form-group">
                <label htmlFor="unit">Unidad de Medida</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  {UNIT_MEASURES.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Precio *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? 'error' : ''}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.price && <span className="error-message">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="supplier">Proveedor *</label>
                <select
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className={errors.supplier ? 'error' : ''}
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplier && <span className="error-message">{errors.supplier}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock">Stock Actual</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={errors.stock ? 'error' : ''}
                  min="0"
                />
                {errors.stock && <span className="error-message">{errors.stock}</span>}
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

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción del producto..."
              />
            </div>

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
                {isSubmitting ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductForm;
