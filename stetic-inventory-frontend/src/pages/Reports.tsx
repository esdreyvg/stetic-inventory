import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import type { 
  MonthlyCostReport, 
  SupplierRanking, 
  ConsumptionReport, 
  StockReport, 
  DashboardMetrics,
  ReportFilters 
} from '@/types/report';
import { reportService } from '@/services/reports';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Reports.css';

const Reports: React.FC = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'costs' | 'suppliers' | 'consumption' | 'stock' | 'exports'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Data states
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [monthlyCosts, setMonthlyCosts] = useState<MonthlyCostReport[]>([]);
  const [supplierRankings, setSupplierRankings] = useState<SupplierRanking[]>([]);
  const [consumptionData, setConsumptionData] = useState<ConsumptionReport[]>([]);
  const [stockData, setStockData] = useState<StockReport[]>([]);
  
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    reportType: 'monthly'
  });

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const metrics = await reportService.getDashboardMetrics();
      setDashboardMetrics(metrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCostReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const costs = await reportService.getMonthlyCostReports(filters);
      setMonthlyCosts(costs);
    } catch (error) {
      console.error('Error loading cost reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadSupplierRankings = useCallback(async () => {
    setIsLoading(true);
    try {
      const suppliers = await reportService.getSupplierRankings();
      setSupplierRankings(suppliers);
    } catch (error) {
      console.error('Error loading supplier rankings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadConsumptionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const consumption = await reportService.getConsumptionReports(filters);
      setConsumptionData(consumption);
    } catch (error) {
      console.error('Error loading consumption data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadStockData = useCallback(async () => {
    setIsLoading(true);
    try {
      const stock = await reportService.getStockReports();
      setStockData(stock);
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'pdf', reportType: string, data: any[]) => {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        const csvContent = await reportService.exportToCSV(reportType, data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const pdfBlob = await reportService.exportToPDF(reportType, data);
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'dashboard':
        loadDashboardData();
        break;
      case 'costs':
        loadCostReports();
        break;
      case 'suppliers':
        loadSupplierRankings();
        break;
      case 'consumption':
        loadConsumptionData();
        break;
      case 'stock':
        loadStockData();
        break;
    }
  }, [loadDashboardData, loadCostReports, loadSupplierRankings, loadConsumptionData, loadStockData]);

  const handleFilterChange = useCallback((key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

  if (!hasRole(['administrador', 'gerente'])) {
    return (
      <div className="reports-container">
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para ver los reportes.</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-content">
        <div className="reports-header">
          <h2>Sistema de inventario integral para estética & spa</h2>
          <div className="export-actions">
            {activeTab !== 'dashboard' && (
              <>
                <button 
                  className="btn-export"
                  onClick={() => {
                    const dataMap = {
                      costs: monthlyCosts,
                      suppliers: supplierRankings,
                      consumption: consumptionData,
                      stock: stockData
                    };
                    handleExport('csv', activeTab, dataMap[activeTab as keyof typeof dataMap] || []);
                  }}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exportando...' : 'Exportar CSV'}
                </button>
                <button 
                  className="btn-export"
                  onClick={() => {
                    const dataMap = {
                      costs: monthlyCosts,
                      suppliers: supplierRankings,
                      consumption: consumptionData,
                      stock: stockData
                    };
                    handleExport('pdf', activeTab, dataMap[activeTab as keyof typeof dataMap] || []);
                  }}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exportando...' : 'Exportar PDF'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab ${activeTab === 'costs' ? 'active' : ''}`}
            onClick={() => handleTabChange('costs')}
          >
            Costos Mensuales
          </button>
          <button 
            className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => handleTabChange('suppliers')}
          >
            Ranking Proveedores
          </button>
          <button 
            className={`tab ${activeTab === 'consumption' ? 'active' : ''}`}
            onClick={() => handleTabChange('consumption')}
          >
            Consumo
          </button>
          <button 
            className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => handleTabChange('stock')}
          >
            Stock
          </button>
        </div>

        {/* Filters */}
        {activeTab !== 'dashboard' && activeTab !== 'suppliers' && (
          <div className="reports-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Desde:</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Hasta:</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <label>Período:</label>
                <select
                  value={filters.reportType}
                  onChange={(e) => handleFilterChange('reportType', e.target.value)}
                  className="filter-select"
                >
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        <div className="reports-content-area">
          {isLoading ? (
            <div className="loading-state">Cargando reportes...</div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && dashboardMetrics && (
                <div className="dashboard-content">
                  <div className="metrics-grid">
                    <div className="metric-card revenue">
                      <h3>Ingresos Totales</h3>
                      <span className="metric-value">${dashboardMetrics.totalRevenue.toLocaleString()}</span>
                      <span className="metric-label">Este período</span>
                    </div>
                    <div className="metric-card costs">
                      <h3>Costos Totales</h3>
                      <span className="metric-value">${dashboardMetrics.totalCosts.toLocaleString()}</span>
                      <span className="metric-label">Este período</span>
                    </div>
                    <div className="metric-card margin">
                      <h3>Margen de Ganancia</h3>
                      <span className="metric-value">{dashboardMetrics.profitMargin.toFixed(1)}%</span>
                      <span className="metric-label">Promedio</span>
                    </div>
                    <div className="metric-card products">
                      <h3>Total Productos</h3>
                      <span className="metric-value">{dashboardMetrics.totalProducts}</span>
                      <span className="metric-label">En inventario</span>
                    </div>
                  </div>

                  <div className="alerts-grid">
                    <div className="alert-card low-stock">
                      <h4>Stock Bajo</h4>
                      <span className="alert-number">{dashboardMetrics.lowStockItems}</span>
                      <span className="alert-label">productos</span>
                    </div>
                    <div className="alert-card expiring">
                      <h4>Por Vencer</h4>
                      <span className="alert-number">{dashboardMetrics.expiringItems}</span>
                      <span className="alert-label">productos</span>
                    </div>
                    <div className="alert-card maintenance">
                      <h4>Mantenimiento</h4>
                      <span className="alert-number">{dashboardMetrics.maintenanceDue}</span>
                      <span className="alert-label">activos</span>
                    </div>
                  </div>

                  <div className="top-category">
                    <h3>Categoría Más Vendida</h3>
                    <p>{dashboardMetrics.topPerformingCategory}</p>
                  </div>
                </div>
              )}

              {/* Monthly Costs Tab */}
              {activeTab === 'costs' && (
                <div className="costs-content">
                  <div className="chart-container">
                    <h3>Evolución de Costos Mensuales</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={monthlyCosts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="productCosts" fill="#667eea" name="Productos" />
                        <Bar dataKey="supplyCosts" fill="#f093fb" name="Suministros" />
                        <Bar dataKey="maintenanceCosts" fill="#4facfe" name="Mantenimiento" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-container">
                    <h3>Tendencia de Costos Totales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyCosts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="totalCosts" stroke="#667eea" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Suppliers Tab */}
              {activeTab === 'suppliers' && (
                <div className="suppliers-content">
                  <div className="suppliers-table">
                    <h3>Ranking de Proveedores</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Posición</th>
                          <th>Proveedor</th>
                          <th>Compras Totales</th>
                          <th>Costo Promedio</th>
                          <th>Productos</th>
                          <th>Confiabilidad</th>
                          <th>Ahorros</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierRankings.map((supplier, index) => (
                          <tr key={supplier.id}>
                            <td>
                              <span className={`rank ${index < 3 ? 'top' : ''}`}>
                                #{index + 1}
                              </span>
                            </td>
                            <td>{supplier.name}</td>
                            <td>${supplier.totalPurchases.toLocaleString()}</td>
                            <td>${supplier.averageCost.toFixed(2)}</td>
                            <td>{supplier.productCount}</td>
                            <td>
                              <div className="reliability-bar">
                                <div 
                                  className="reliability-fill"
                                  style={{ width: `${supplier.reliability}%` }}
                                ></div>
                                <span>{supplier.reliability}%</span>
                              </div>
                            </td>
                            <td className="savings">${supplier.totalSavings.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="chart-container">
                    <h3>Distribución de Compras por Proveedor</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={supplierRankings.map(supplier => ({
                            name: supplier.name,
                            totalPurchases: supplier.totalPurchases,
                            id: supplier.id,
                            averageCost: supplier.averageCost,
                            productCount: supplier.productCount,
                            reliability: supplier.reliability,
                            totalSavings: supplier.totalSavings
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="totalPurchases"
                          label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                        >
                          {supplierRankings.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Consumption Tab */}
              {activeTab === 'consumption' && (
                <div className="consumption-content">
                  <div className="chart-container">
                    <h3>Consumo por Producto</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={consumptionData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="productName" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalConsumed" fill="#667eea" name="Unidades Consumidas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="consumption-table">
                    <h3>Detalle de Consumo</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Total Consumido</th>
                          <th>Costo Total</th>
                          <th>Promedio Mensual</th>
                          <th>Tendencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumptionData.map(item => (
                          <tr key={item.productId}>
                            <td>{item.productName}</td>
                            <td>{item.category}</td>
                            <td>{item.totalConsumed} {item.unit}</td>
                            <td>${item.totalCost.toFixed(2)}</td>
                            <td>{item.averageMonthlyConsumption.toFixed(1)} {item.unit}</td>
                            <td>
                              <span className={`trend ${item.trend}`}>
                                {item.trend === 'increasing' ? '↗️ Creciente' :
                                 item.trend === 'decreasing' ? '↘️ Decreciente' : '➡️ Estable'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stock Tab */}
              {activeTab === 'stock' && (
                <div className="stock-content">
                  <div className="stock-summary">
                    <div className="status-cards">
                      <div className="status-card optimal">
                        <h4>Stock Óptimo</h4>
                        <span>{stockData.filter(s => s.status === 'optimal').length}</span>
                      </div>
                      <div className="status-card low">
                        <h4>Stock Bajo</h4>
                        <span>{stockData.filter(s => s.status === 'low').length}</span>
                      </div>
                      <div className="status-card critical">
                        <h4>Stock Crítico</h4>
                        <span>{stockData.filter(s => s.status === 'critical').length}</span>
                      </div>
                      <div className="status-card excess">
                        <h4>Exceso Stock</h4>
                        <span>{stockData.filter(s => s.status === 'excess').length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stock-table">
                    <h3>Análisis de Inventario</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Stock Actual</th>
                          <th>Stock Mínimo</th>
                          <th>Valor Inventario</th>
                          <th>Rotación</th>
                          <th>Días Stock</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockData.map(item => (
                          <tr key={item.productId} className={item.status}>
                            <td>{item.productName}</td>
                            <td>{item.currentStock} {item.unit}</td>
                            <td>{item.minStock} {item.unit}</td>
                            <td>${item.stockValue.toFixed(2)}</td>
                            <td>{item.turnoverRate.toFixed(1)}x</td>
                            <td>{item.daysOfStock} días</td>
                            <td>
                              <span className={`status-badge ${item.status}`}>
                                {item.status === 'optimal' ? 'Óptimo' :
                                 item.status === 'low' ? 'Bajo' :
                                 item.status === 'critical' ? 'Crítico' : 'Exceso'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="chart-container">
                    <h3>Valor del Inventario por Producto</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stockData.map(item => ({
                            productName: item.productName,
                            stockValue: item.stockValue
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="stockValue"
                          label={({ productName, percent }) => `${productName} ${((percent as number) * 100).toFixed(0)}%`}
                        >
                          {stockData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
