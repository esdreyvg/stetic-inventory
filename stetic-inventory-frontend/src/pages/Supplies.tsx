import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Supply, SupplyFilters, SupplyCategory, SupplyConsumption, CreateConsumptionData } from '@/types/supply';
import { supplyService } from '@/services/supplies';
import SupplyForm from '@/components/SupplyForm';
import SupplyConsumptionModal from '@/components/SupplyConsumptionModal';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Supplies.css';

const Supplies: React.FC = () => {
  const { hasRole } = useAuth();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [filteredSupplies, setFilteredSupplies] = useState<Supply[]>([]);
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | undefined>();
  const [activeTab, setActiveTab] = useState<'all' | 'consumible' | 'reutilizable' | 'desechable'>('all');
  
  // Consumption History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSupplyHistory, setSelectedSupplyHistory] = useState<Supply | null>(null);
  const [consumptionHistory, setConsumptionHistory] = useState<SupplyConsumption[]>([]);
  
  // Consumption Modal
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [selectedSupplyConsumption, setSelectedSupplyConsumption] = useState<Supply | null>(null);
  
  const [filters, setFilters] = useState<SupplyFilters>({
    search: '',
    category: '',
    type: '',
    supplier: '',
    status: '',
    location: '',
    showLowStock: false,
    showExpiring: false
  });

  const canManageSupplies = useMemo(() => hasRole(['administrador', 'gerente']), [hasRole]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [suppliesData, categoriesData, suppliersData, locationsData] = await Promise.all([
        supplyService.getSupplies(),
        supplyService.getCategories(),
        supplyService.getSuppliers(),
        supplyService.getLocations()
      ]);
      
      setSupplies(suppliesData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...supplies];

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(supply => supply.type === activeTab);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(supply =>
        supply.name.toLowerCase().includes(searchLower) ||
        supply.description?.toLowerCase().includes(searchLower) ||
        supply.supplier.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(supply => supply.category === filters.category);
    }

    if (filters.supplier) {
      filtered = filtered.filter(supply => supply.supplier === filters.supplier);
    }

    if (filters.status) {
      filtered = filtered.filter(supply => supply.status === filters.status);
    }

    if (filters.location) {
      filtered = filtered.filter(supply => supply.location === filters.location);
    }

    if (filters.showLowStock) {
      filtered = filtered.filter(supply => supply.currentStock <= supply.minStock);
    }

    if (filters.showExpiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      filtered = filtered.filter(supply => {
        if (!supply.expirationDate) return false;
        return new Date(supply.expirationDate) <= thirtyDaysFromNow;
      });
    }

    setFilteredSupplies(filtered);
  }, [supplies, filters, activeTab]);

  const handleCreateSupply = useCallback(() => {
    setEditingSupply(undefined);
    setShowForm(true);
  }, []);

  const handleEditSupply = useCallback((supply: Supply) => {
    setEditingSupply(supply);
    setShowForm(true);
  }, []);

  const handleSaveSupply = useCallback((savedSupply: Supply) => {
    if (editingSupply) {
      setSupplies(prev => prev.map(s => 
        s.id === savedSupply.id ? savedSupply : s
      ));
    } else {
      setSupplies(prev => [...prev, savedSupply]);
    }
  }, [editingSupply]);

  const handleShowHistory = useCallback(async (supply: Supply) => {
    setSelectedSupplyHistory(supply);
    try {
      const history = await supplyService.getConsumptions(supply.id);
      setConsumptionHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading consumption history:', error);
    }
  }, []);

  const handleConsume = useCallback((supply: Supply) => {
    setSelectedSupplyConsumption(supply);
    setShowConsumptionModal(true);
  }, []);

  const handleConsumptionComplete = useCallback(async () => {
    // Reload supplies to update stock
    loadInitialData();
  }, [loadInitialData]);

  const handleFilterChange = useCallback((key: keyof SupplyFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      type: '',
      supplier: '',
      status: '',
      location: '',
      showLowStock: false,
      showExpiring: false
    });
    setActiveTab('all');
  }, []);

  const getStatusColor = (status: Supply['status']) => {
    switch (status) {
      case 'disponible': return '#27ae60';
      case 'agotado': return '#e74c3c';
      case 'por_vencer': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: Supply['status']) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'agotado': return 'Agotado';
      case 'por_vencer': return 'Por Vencer';
      default: return status;
    }
  };

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration <= 7) return { text: `${daysUntilExpiration}d`, class: 'expires-soon' };
    if (daysUntilExpiration <= 30) return { text: `${daysUntilExpiration}d`, class: 'expires-month' };
    
    return null;
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (isLoading) {
    return (
      <div className="supplies-container">
        <div className="loading-state">Cargando insumos...</div>
      </div>
    );
  }

  return (
    <div className="supplies-container">
      <div className="supplies-content">
        <div className="supplies-header">
          <h2>Gestión de Insumos</h2>
          {canManageSupplies && (
            <button className="btn-primary" onClick={handleCreateSupply}>
              Crear Insumo
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todos
          </button>
          <button 
            className={`tab ${activeTab === 'consumible' ? 'active' : ''}`}
            onClick={() => setActiveTab('consumible')}
          >
            Consumibles
          </button>
          <button 
            className={`tab ${activeTab === 'reutilizable' ? 'active' : ''}`}
            onClick={() => setActiveTab('reutilizable')}
          >
            Reutilizables
          </button>
          <button 
            className={`tab ${activeTab === 'desechable' ? 'active' : ''}`}
            onClick={() => setActiveTab('desechable')}
          >
            Desechables
          </button>
        </div>

        {/* Filters */}
        <div className="supplies-filters">
          <div className="filter-row">
            <div className="search-group">
              <input
                type="text"
                placeholder="Buscar insumos..."
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
                <option value="disponible">Disponible</option>
                <option value="agotado">Agotado</option>
                <option value="por_vencer">Por Vencer</option>
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
                  checked={filters.showLowStock}
                  onChange={(e) => handleFilterChange('showLowStock', e.target.checked)}
                />
                Stock bajo
              </label>

              <label className="toggle-filter">
                <input
                  type="checkbox"
                  checked={filters.showExpiring}
                  onChange={(e) => handleFilterChange('showExpiring', e.target.checked)}
                />
                Por vencer
              </label>
            </div>

            <button className="btn-secondary" onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="supplies-stats">
          <div className="stat-card">
            <span className="stat-number">{filteredSupplies.length}</span>
            <span className="stat-label">Total Insumos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredSupplies.filter(s => s.status === 'disponible').length}
            </span>
            <span className="stat-label">Disponibles</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredSupplies.filter(s => s.currentStock <= s.minStock).length}
            </span>
            <span className="stat-label">Stock Bajo</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredSupplies.filter(s => s.status === 'por_vencer').length}
            </span>
            <span className="stat-label">Por Vencer</span>
          </div>
        </div>

        {/* Supplies Table */}
        <div className="supplies-table">
          <table>
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Tipo</th>
                <th>Stock</th>
                <th>Costo</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupplies.map(supply => {
                const expirationStatus = getExpirationStatus(supply.expirationDate);
                
                return (
                  <tr key={supply.id}>
                    <td>
                      <div className="supply-info">
                        <span className="supply-name">{supply.name}</span>
                        {supply.description && (
                          <span className="supply-description">{supply.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${supply.type}`}>
                        {supply.type === 'consumible' ? 'Consumible' : 
                         supply.type === 'reutilizable' ? 'Reutilizable' : 'Desechable'}
                      </span>
                    </td>
                    <td>
                      <div className="stock-info">
                        <span className="stock-current">
                          {supply.currentStock} {supply.unit}
                        </span>
                        <span className="stock-min">
                          Mín: {supply.minStock} {supply.unit}
                        </span>
                        {supply.currentStock <= supply.minStock && (
                          <span className="stock-warning">¡Stock bajo!</span>
                        )}
                      </div>
                    </td>
                    <td className="supply-cost">
                      ${supply.unitCost.toFixed(2)}/{supply.unit}
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(supply.status) }}
                      >
                        {getStatusText(supply.status)}
                      </span>
                    </td>
                    <td>
                      {supply.expirationDate ? (
                        <div className="expiration-info">
                          <div>{new Date(supply.expirationDate).toLocaleDateString()}</div>
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
                    <td>{supply.location}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-consume"
                          onClick={() => handleConsume(supply)}
                          disabled={supply.currentStock <= 0}
                        >
                          Consumir
                        </button>
                        <button
                          className="btn-history"
                          onClick={() => handleShowHistory(supply)}
                        >
                          Historial
                        </button>
                        {canManageSupplies && (
                          <button
                            className="btn-edit"
                            onClick={() => handleEditSupply(supply)}
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSupplies.length === 0 && (
            <div className="no-supplies">
              <p>No se encontraron insumos que coincidan con los filtros.</p>
            </div>
          )}
        </div>

        <SupplyForm
          supply={editingSupply}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSaveSupply}
        />

        <SupplyConsumptionModal
          supply={selectedSupplyConsumption}
          isOpen={showConsumptionModal}
          onClose={() => setShowConsumptionModal(false)}
          onConsume={handleConsumptionComplete}
        />

        {/* Consumption History Modal */}
        {showHistoryModal && selectedSupplyHistory && (
          <div className="consumption-history-overlay">
            <div className="consumption-history-modal">
              <div className="modal-header">
                <h3>Historial de Consumo - {selectedSupplyHistory.name}</h3>
                <button 
                  className="btn-close" 
                  onClick={() => setShowHistoryModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="consumption-content">
                {consumptionHistory.length > 0 ? (
                  <div className="consumption-list">
                    {consumptionHistory.map(consumption => (
                      <div key={consumption.id} className="consumption-item">
                        <div className="consumption-header">
                          <span className="consumption-service">
                            {consumption.serviceName || 'Consumo general'}
                          </span>
                          <span className="consumption-date">
                            {new Date(consumption.consumptionDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="consumption-details">
                          <div className="consumption-detail">
                            <span className="detail-label">Cantidad</span>
                            <span className="detail-value">
                              {consumption.quantityUsed} {consumption.unit}
                            </span>
                          </div>
                          <div className="consumption-detail">
                            <span className="detail-label">Costo</span>
                            <span className="detail-value">
                              ${consumption.totalCost.toFixed(2)}
                            </span>
                          </div>
                          <div className="consumption-detail">
                            <span className="detail-label">Realizado por</span>
                            <span className="detail-value">
                              {consumption.performedBy}
                            </span>
                          </div>
                          {consumption.clientName && (
                            <div className="consumption-detail">
                              <span className="detail-label">Cliente</span>
                              <span className="detail-value">
                                {consumption.clientName}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {consumption.notes && (
                          <div className="consumption-notes">
                            {consumption.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-supplies">
                    <p>No hay registros de consumo para este insumo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Supplies;
