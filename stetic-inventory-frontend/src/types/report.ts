export interface MonthlyCostReport {
  month: string;
  year: number;
  productCosts: number;
  supplyCosts: number;
  maintenanceCosts: number;
  totalCosts: number;
}

export interface SupplierRanking {
  id: string;
  name: string;
  totalPurchases: number;
  averageCost: number;
  productCount: number;
  reliability: number;
  lastPurchaseDate: string;
  totalSavings: number;
}

export interface ConsumptionReport {
  productId: string;
  productName: string;
  category: string;
  totalConsumed: number;
  unit: string;
  totalCost: number;
  averageMonthlyConsumption: number;
  peakMonth: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface StockReport {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  stockValue: number;
  turnoverRate: number;
  daysOfStock: number;
  status: 'optimal' | 'low' | 'excess' | 'critical';
}

export interface AssetReport {
  assetId: string;
  assetName: string;
  category: string;
  acquisitionCost: number;
  currentValue: number;
  depreciation: number;
  maintenanceCosts: number;
  utilizationRate: number;
  nextMaintenance: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ExpirationReport {
  productId: string;
  productName: string;
  category: string;
  batchNumber: string;
  expirationDate: string;
  daysUntilExpiration: number;
  currentStock: number;
  estimatedLoss: number;
  recommendedAction: 'use_immediately' | 'promote' | 'discount' | 'dispose';
}

export interface RevenueReport {
  month: string;
  year: number;
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  averageTicket: number;
  clientCount: number;
  profitMargin: number;
}

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  category?: string;
  supplier?: string;
  reportType: 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalCosts: number;
  profitMargin: number;
  totalProducts: number;
  lowStockItems: number;
  expiringItems: number;
  maintenanceDue: number;
  topPerformingCategory: string;
}
