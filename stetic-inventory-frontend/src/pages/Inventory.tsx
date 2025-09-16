import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { InventoryItem, InventoryAlert, InventoryFilters } from '@/types/inventory';
import { inventoryService } from '@/services/inventory';
import ConsumptionModal from '@/components/ConsumptionModal';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Inventory.css';

const Inventory: React.FC = () => {
  const { hasRole } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'resale' | 'all'>('all');
  
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: '',
    supplier: '',
    status: '',
    location: '',
    type: '',
    showExpiringSoon: false,
    showLowStock: false
  });

  const canManageInventory = hasRole(['administrador', 'gerente']);

  useEffect(() => {
    loadData();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const applyFilters = () => {
    let filtered = [...inventoryItems];

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab);
    }

    // Apply other filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchLower) ||
        item.productCode.toLowerCase().includes(searchLower) ||
        item.batchNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.supplier) {
      filtered = filtered.filter(item => item.supplier === filters.supplier);
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location);
    }

    if (filters.showExpiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      filtered = filtered.filter(item => {
        if (!item.expirationDate) return false;
        return new Date(item.expirationDate) <= thirtyDaysFromNow;
      });
    }

    if (filters.showLowStock) {
      filtered = filtered.filter(item => item.availableQuantity <= item.minStock);
    }

    setFilteredItems(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [inventoryItems, filters, activeTab, applyFilters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [itemsData, alertsData] = await Promise.all([
        inventoryService.getInventoryItems(),
        inventoryService.getInventoryAlerts()
      ]);
      
      setInventoryItems(itemsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsume = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowConsumptionModal(true);
  };

  const handleConsumptionComplete = () => {
    loadData(); // Reload data after consumption
  };

  const handleFilterChange = (key: keyof InventoryFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      supplier: '',
      status: '',
      location: '',
      type: '',
      showExpiringSoon: false,
      showLowStock: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sealed': return '#27ae60';
      case 'opened': return '#f39c12';
      case 'expired': return '#e74c3c';
      case 'out_of_stock': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sealed': return 'Sellado';
      case 'opened': return 'Abierto';
      case 'expired': return 'Expirado';
      case 'out_of_stock': return 'Sin Stock';
      default: return status;
    }
  };

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) return { status: 'expired', text: 'Expirado', class: 'expired' };
    if (daysUntilExpiration <= 7) return { status: 'expires-soon', text: `${daysUntilExpiration}d`, class: 'expires-soon' };
    if (daysUntilExpiration <= 30) return { status: 'expires-month', text: `${daysUntilExpiration}d`, class: 'expires-month' };
    
    return null;
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

  if (isLoading) {
    return (
      <div className="inventory-container">
        <div className="loading-state">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Gestión de Inventario</h2>
        <div className="header-actions">
          {canManageInventory && (
            <Link to="/products" className="btn-primary">
              Gestionar Productos
            </Link>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h3>Alertas de Inventario</h3>
          <div className="alerts-list">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`alert ${getAlertSeverityClass(alert.severity)}`}>
                <span className="alert-icon">
                  {alert.type === 'expiration' && '⏰'}
                  {alert.type === 'expired' && '❌'}
                  {alert.type === 'low_stock' && '📦'}
                  {alert.type === 'out_of_stock' && '🚫'}
                </span>
                <div className="alert-content">
                  <strong>{alert.productName}</strong>
                  <span>{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todo el Inventario ({inventoryItems.length})
        </button>
        <button 
          className={`tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Servicios ({inventoryItems.filter(i => i.type === 'service').length})
        </button>
        <button 
          className={`tab ${activeTab === 'resale' ? 'active' : ''}`}
          onClick={() => setActiveTab('resale')}
        >
          Reventa ({inventoryItems.filter(i => i.type === 'resale').length})
        </button>
      </div>

      {/* Filters */}
      <div className="inventory-filters">
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
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="sealed">Sellado</option>
              <option value="opened">Abierto</option>
              <option value="expired">Expirado</option>
              <option value="out_of_stock">Sin Stock</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filter-select"
            >
              <option value="">Todas las ubicaciones</option>
              <option value="Almacén Principal">Almacén Principal</option>
              <option value="Vitrina de Ventas">Vitrina de Ventas</option>
              <option value="Sala de Masajes">Sala de Masajes</option>
              <option value="Sala de Tratamientos">Sala de Tratamientos</option>
            </select>
          </div>

          <div className="toggle-filters">
            <label className="toggle-filter">
              <input
                type="checkbox"
                checked={filters.showExpiringSoon}
                onChange={(e) => handleFilterChange('showExpiringSoon', e.target.checked)}
              />
              Próximo a vencer
            </label>
            <label className="toggle-filter">
              <input
                type="checkbox"
                checked={filters.showLowStock}
                onChange={(e) => handleFilterChange('showLowStock', e.target.checked)}
              />
              Stock bajo
            </label>
          </div>

          <button className="btn-secondary" onClick={clearFilters}>
            Limpiar
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="inventory-stats">
        <div className="stat-card">
          <span className="stat-number">{filteredItems.length}</span>
          <span className="stat-label">Items Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredItems.filter(i => i.availableQuantity <= i.minStock).length}
          </span>
          <span className="stat-label">Stock Bajo</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {filteredItems.filter(i => i.status === 'opened').length}
          </span>
          <span className="stat-label">En Uso</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {alerts.filter(a => a.type === 'expiration' || a.type === 'expired').length}
          </span>
          <span className="stat-label">Por Vencer</span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th>Vencimiento</th>
              <th>Lote</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const expirationStatus = getExpirationStatus(item.expirationDate);
              
              return (
                <tr key={item.id}>
                  <td>
                    <div className="product-info">
                      <span className="product-name">{item.productName}</span>
                      <span className="product-code">{item.productCode}</span>
                      <span className="product-size">{item.unitSize}ml por {item.unit}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${item.type}`}>
                      {item.type === 'service' ? 'Servicio' : 'Reventa'}
                    </span>
                  </td>
                  <td>
                    <div className="stock-info">
                      <div className="stock-available">
                        <strong>{item.availableQuantity}</strong> disponible
                      </div>
                      {item.openedQuantity > 0 && (
                        <div className="stock-opened">
                          {item.openedQuantity} en uso
                        </div>
                      )}
                      <div className="stock-total">
                        Total: {item.totalQuantity} {item.unit}(s)
                      </div>
                      {item.availableQuantity <= item.minStock && (
                        <div className="stock-warning">⚠️ Stock bajo</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td>{item.location}</td>
                  <td>
                    {item.expirationDate ? (
                      <div className="expiration-info">
                        <div>{new Date(item.expirationDate).toLocaleDateString()}</div>
                        {expirationStatus && (
                          <span className={`expiration-status ${expirationStatus.class}`}>
                            {expirationStatus.text}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-expiration">Sin vencimiento</span>
                    )}
                  </td>
                  <td>{item.batchNumber || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      {item.availableQuantity > 0 && item.status !== 'expired' && (
                        <button
                          className="btn-consume"
                          onClick={() => handleConsume(item)}
                        >
                          Consumir
                        </button>
                      )}
                      <button className="btn-details">Detalles</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="no-items">
            <p>No se encontraron items que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      <ConsumptionModal
        item={selectedItem}
        isOpen={showConsumptionModal}
        onClose={() => setShowConsumptionModal(false)}
        onConsume={handleConsumptionComplete}
      />
    </div>
  );
};

export default Inventory;