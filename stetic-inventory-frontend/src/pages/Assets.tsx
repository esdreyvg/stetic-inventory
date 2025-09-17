import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Asset, AssetFilters, AssetCategory, MaintenanceAlert, AssetStatus } from '@/types/asset';
import { assetService } from '@/services/assets';
import AssetForm from '@/components/AssetForm';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Assets.css';

const Assets: React.FC = () => {
  const { hasRole } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  
  const [filters, setFilters] = useState<AssetFilters>({
    search: '',
    category: '',
    supplier: '',
    status: '',
    location: '',
    showWarrantyExpiring: false,
    showMaintenanceDue: false
  });

  const canManageAssets = useMemo(() => hasRole(['administrador', 'gerente']), [hasRole]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [assetsData, categoriesData, suppliersData, locationsData, alertsData] = await Promise.all([
        assetService.getAssets(),
        assetService.getCategories(),
        assetService.getSuppliers(),
        assetService.getLocations(),
        assetService.getMaintenanceAlerts()
      ]);
      
      setAssets(assetsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setLocations(locationsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...assets];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.brand?.toLowerCase().includes(searchLower) ||
        asset.model?.toLowerCase().includes(searchLower) ||
        asset.serialNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(asset => asset.category === filters.category);
    }

    if (filters.supplier) {
      filtered = filtered.filter(asset => asset.supplier === filters.supplier);
    }

    if (filters.status) {
      filtered = filtered.filter(asset => asset.status === filters.status);
    }

    if (filters.location) {
      filtered = filtered.filter(asset => asset.location === filters.location);
    }

    if (filters.showWarrantyExpiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      filtered = filtered.filter(asset => {
        if (!asset.warrantyEndDate) return false;
        return new Date(asset.warrantyEndDate) <= thirtyDaysFromNow;
      });
    }

    setFilteredAssets(filtered);
  }, [assets, filters]);

  const handleCreateAsset = useCallback(() => {
    setEditingAsset(undefined);
    setShowForm(true);
  }, []);

  const handleEditAsset = useCallback((asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  }, []);

  const handleSaveAsset = useCallback((savedAsset: Asset) => {
    if (editingAsset) {
      setAssets(prev => prev.map(a => 
        a.id === savedAsset.id ? savedAsset : a
      ));
    } else {
      setAssets(prev => [...prev, savedAsset]);
    }
  }, [editingAsset]);

  const handleStatusChange = useCallback(async (asset: Asset, newStatus: AssetStatus) => {
    try {
      const updatedAsset = await assetService.updateAssetStatus(asset.id, newStatus);
      setAssets(prev => prev.map(a => 
        a.id === updatedAsset.id ? updatedAsset : a
      ));
    } catch (error) {
      console.error('Error updating asset status:', error);
    }
  }, []);

  const handleFilterChange = useCallback((key: keyof AssetFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      supplier: '',
      status: '',
      location: '',
      showWarrantyExpiring: false,
      showMaintenanceDue: false
    });
  }, []);

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case 'activo': return '#27ae60';
      case 'en_mantenimiento': return '#f39c12';
      case 'dado_de_baja': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: AssetStatus) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'en_mantenimiento': return 'Mantenimiento';
      case 'dado_de_baja': return 'Dado de Baja';
      default: return status;
    }
  };

  const getWarrantyStatus = (warrantyEndDate?: string) => {
    if (!warrantyEndDate) return null;
    
    const now = new Date();
    const warrantyDate = new Date(warrantyEndDate);
    const daysUntilExpiry = Math.ceil((warrantyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', text: 'Expirada', class: 'warranty-expired' };
    if (daysUntilExpiry <= 7) return { status: 'expires-soon', text: `${daysUntilExpiry}d`, class: 'warranty-expires-soon' };
    if (daysUntilExpiry <= 30) return { status: 'expires-month', text: `${daysUntilExpiry}d`, class: 'warranty-expires-month' };
    
    return { status: 'valid', text: 'Vigente', class: 'warranty-valid' };
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
      <div className="assets-container">
        <div className="loading-state">Cargando activos...</div>
      </div>
    );
  }

  return (
    <div className="assets-container">
      <div className="assets-content">
        <div className="assets-header">
          <h2>Gestión de Activos Fijos</h2>
          {canManageAssets && (
            <button className="btn-primary" onClick={handleCreateAsset}>
              Crear Activo
            </button>
          )}
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="alerts-section">
            <h3>Alertas de Activos</h3>
            <div className="alerts-list">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`alert ${getAlertSeverityClass(alert.severity)}`}>
                  <span className="alert-icon">
                    {alert.type === 'warranty_expiring' && '⏰'}
                    {alert.type === 'warranty_expired' && '❌'}
                    {alert.type === 'maintenance_due' && '🔧'}
                  </span>
                  <div className="alert-content">
                    <strong>{alert.assetName}</strong>
                    <span>{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="assets-filters">
          <div className="filter-row">
            <div className="search-group">
              <input
                type="text"
                placeholder="Buscar activos..."
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
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="en_mantenimiento">Mantenimiento</option>
                <option value="dado_de_baja">Dado de Baja</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="toggle-filters">
              <label className="toggle-filter">
                <input
                  type="checkbox"
                  checked={filters.showWarrantyExpiring}
                  onChange={(e) => handleFilterChange('showWarrantyExpiring', e.target.checked)}
                />
                Garantía por vencer
              </label>
            </div>

            <button className="btn-secondary" onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="assets-stats">
          <div className="stat-card">
            <span className="stat-number">{filteredAssets.length}</span>
            <span className="stat-label">Total Activos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredAssets.filter(a => a.status === 'activo').length}
            </span>
            <span className="stat-label">Activos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredAssets.filter(a => a.status === 'en_mantenimiento').length}
            </span>
            <span className="stat-label">Mantenimiento</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {alerts.filter(a => a.type === 'warranty_expiring' || a.type === 'warranty_expired').length}
            </span>
            <span className="stat-label">Garantías por Vencer</span>
          </div>
        </div>

        {/* Assets Table */}
        <div className="assets-table">
          <table>
            <thead>
              <tr>
                <th>Activo</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Costo</th>
                <th>Garantía</th>
                <th>Proveedor</th>
                {canManageAssets && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => {
                const warrantyStatus = getWarrantyStatus(asset.warrantyEndDate);
                
                return (
                  <tr key={asset.id}>
                    <td>
                      <div className="asset-info">
                        <span className="asset-name">{asset.name}</span>
                        <span className="asset-details">
                          {asset.brand && asset.model ? `${asset.brand} ${asset.model}` : asset.brand || asset.model || ''}
                        </span>
                        {asset.serialNumber && (
                          <span className="asset-serial">S/N: {asset.serialNumber}</span>
                        )}
                      </div>
                    </td>
                    <td>{asset.category}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(asset.status) }}
                      >
                        {getStatusText(asset.status)}
                      </span>
                    </td>
                    <td>{asset.location}</td>
                    <td className="asset-cost">
                      ${asset.cost.toLocaleString()}
                    </td>
                    <td>
                      {asset.warrantyEndDate ? (
                        <div className="warranty-info">
                          <div>{new Date(asset.warrantyEndDate).toLocaleDateString()}</div>
                          {warrantyStatus && (
                            <span className={`warranty-status ${warrantyStatus.class}`}>
                              {warrantyStatus.text}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="no-warranty">Sin garantía</span>
                      )}
                    </td>
                    <td>{asset.supplier}</td>
                    {canManageAssets && (
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditAsset(asset)}
                          >
                            Editar
                          </button>
                          <select
                            value={asset.status}
                            onChange={(e) => handleStatusChange(asset, e.target.value as AssetStatus)}
                            className="status-select"
                          >
                            <option value="activo">Activo</option>
                            <option value="en_mantenimiento">Mantenimiento</option>
                            <option value="dado_de_baja">Dado de Baja</option>
                          </select>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAssets.length === 0 && (
            <div className="no-assets">
              <p>No se encontraron activos que coincidan con los filtros.</p>
            </div>
          )}
        </div>

        <AssetForm
          asset={editingAsset}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSaveAsset}
        />
      </div>
    </div>
  );
};

export default Assets;
