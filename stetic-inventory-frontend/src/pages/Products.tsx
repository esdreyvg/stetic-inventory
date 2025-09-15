import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Product, ProductFilters, ProductCategory, Supplier } from '@/types/product';
import { productService } from '@/services/products';
import ProductForm from '@/components/ProductForm';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Products.css';

const Products: React.FC = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    supplier: '',
    isActive: true
  });

  const canManageProducts = hasRole(['administrador', 'gerente']);

  const applyFilters = React.useCallback(() => {
    let filtered = [...products];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.code.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.supplier) {
      filtered = filtered.filter(product => product.supplier === filters.supplier);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(product => product.isActive === filters.isActive);
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters, applyFilters]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        productService.getSuppliers()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = (savedProduct: Product) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p.id === savedProduct.id ? savedProduct : p
      ));
    } else {
      // Add new product
      setProducts(prev => [...prev, savedProduct]);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
      try {
        await productService.deleteProduct(product.id);
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, isActive: false } : p
        ));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      supplier: '',
      isActive: true
    });
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock <= product.minStock) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusText = (product: Product) => {
    if (product.stock === 0) return 'Sin stock';
    if (product.stock <= product.minStock) return 'Stock bajo';
    return 'En stock';
  };

  if (isLoading) {
    return (
      <div className="products-container">
        <div className="loading-state">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Gestión de Productos</h2>
        {canManageProducts && (
          <button className="btn-primary" onClick={handleCreateProduct}>
            Crear Producto
          </button>
        )}
      </div>

      <div className="products-filters">
        <div className="filter-row">
          <div className="search-group">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los proveedores</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.isActive ? 'true' : 'false'}
              onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
              className="filter-select"
            >
              <option value="true">Productos activos</option>
              <option value="false">Productos inactivos</option>
            </select>
          </div>

          <button className="btn-secondary" onClick={clearFilters}>
            Limpiar
          </button>
        </div>
      </div>

      <div className="products-stats">
        <div className="stat-card">
          <span className="stat-number">{filteredProducts.length}</span>
          <span className="stat-label">Productos</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredProducts.filter(p => p.stock <= p.minStock).length}
          </span>
          <span className="stat-label">Stock Bajo</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredProducts.filter(p => p.stock === 0).length}
          </span>
          <span className="stat-label">Sin Stock</span>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Proveedor</th>
              {canManageProducts && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td className="product-code">{product.code}</td>
                <td>
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    {product.description && (
                      <span className="product-description">{product.description}</span>
                    )}
                  </div>
                </td>
                <td>{product.category}</td>
                <td className="product-price">
                  ${product.price.toFixed(2)}
                  <span className="price-unit">/ {product.unit}</span>
                </td>
                <td>
                  <div className="stock-info">
                    <span className="stock-amount">{product.stock}</span>
                    <span className={`stock-status ${getStockStatus(product)}`}>
                      {getStockStatusText(product)}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`status ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{product.supplier}</td>
                {canManageProducts && (
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditProduct(product)}
                      >
                        Editar
                      </button>
                      {product.isActive && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No se encontraron productos que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      <ProductForm
        product={editingProduct}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Products;
