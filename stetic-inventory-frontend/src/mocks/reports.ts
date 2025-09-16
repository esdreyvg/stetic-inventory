import type { 
  MonthlyCostReport, 
  SupplierRanking, 
  ConsumptionReport, 
  StockReport, 
  AssetReport, 
  ExpirationReport,
  RevenueReport,
  DashboardMetrics 
} from '@/types/report';

export const mockMonthlyCostReports: MonthlyCostReport[] = [
  {
    month: 'Enero',
    year: 2024,
    productCosts: 4500.00,
    supplyCosts: 1200.00,
    maintenanceCosts: 800.00,
    totalCosts: 6500.00
  },
  {
    month: 'Febrero',
    year: 2024,
    productCosts: 3800.00,
    supplyCosts: 950.00,
    maintenanceCosts: 600.00,
    totalCosts: 5350.00
  },
  {
    month: 'Marzo',
    year: 2024,
    productCosts: 5200.00,
    supplyCosts: 1400.00,
    maintenanceCosts: 1200.00,
    totalCosts: 7800.00
  },
  {
    month: 'Abril',
    year: 2024,
    productCosts: 4800.00,
    supplyCosts: 1100.00,
    maintenanceCosts: 500.00,
    totalCosts: 6400.00
  },
  {
    month: 'Mayo',
    year: 2024,
    productCosts: 5500.00,
    supplyCosts: 1600.00,
    maintenanceCosts: 900.00,
    totalCosts: 8000.00
  },
  {
    month: 'Junio',
    year: 2024,
    productCosts: 4200.00,
    supplyCosts: 980.00,
    maintenanceCosts: 700.00,
    totalCosts: 5880.00
  }
];

export const mockSupplierRankings: SupplierRanking[] = [
  {
    id: '1',
    name: 'Beauty Supplies Pro',
    totalPurchases: 45000.00,
    averageCost: 125.50,
    productCount: 68,
    reliability: 95,
    lastPurchaseDate: '2024-01-20',
    totalSavings: 2400.00
  },
  {
    id: '2',
    name: 'Cosmetic World',
    totalPurchases: 32000.00,
    averageCost: 98.75,
    productCount: 45,
    reliability: 88,
    lastPurchaseDate: '2024-01-15',
    totalSavings: 1800.00
  },
  {
    id: '3',
    name: 'Spa Equipment Ltd',
    totalPurchases: 28000.00,
    averageCost: 156.80,
    productCount: 32,
    reliability: 92,
    lastPurchaseDate: '2024-01-18',
    totalSavings: 1200.00
  },
  {
    id: '4',
    name: 'Natural Beauty Co',
    totalPurchases: 18000.00,
    averageCost: 89.25,
    productCount: 28,
    reliability: 85,
    lastPurchaseDate: '2024-01-12',
    totalSavings: 900.00
  }
];

export const mockConsumptionReports: ConsumptionReport[] = [
  {
    productId: '1',
    productName: 'Crema Hidratante Premium',
    category: 'Cremas Faciales',
    totalConsumed: 45,
    unit: 'unidades',
    totalCost: 2250.00,
    averageMonthlyConsumption: 7.5,
    peakMonth: 'Diciembre',
    trend: 'increasing'
  },
  {
    productId: '2',
    productName: 'Suero Anti-edad',
    category: 'Sueros',
    totalConsumed: 32,
    unit: 'unidades',
    totalCost: 2560.00,
    averageMonthlyConsumption: 5.3,
    peakMonth: 'Noviembre',
    trend: 'stable'
  },
  {
    productId: '3',
    productName: 'Mascarilla Purificante',
    category: 'Mascarillas',
    totalConsumed: 28,
    unit: 'unidades',
    totalCost: 1120.00,
    averageMonthlyConsumption: 4.7,
    peakMonth: 'Octubre',
    trend: 'decreasing'
  }
];

export const mockStockReports: StockReport[] = [
  {
    productId: '1',
    productName: 'Crema Hidratante Premium',
    category: 'Cremas Faciales',
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unit: 'unidades',
    stockValue: 1250.00,
    turnoverRate: 6.2,
    daysOfStock: 45,
    status: 'optimal'
  },
  {
    productId: '2',
    productName: 'Aceite Esencial Lavanda',
    category: 'Aceites',
    currentStock: 5,
    minStock: 8,
    maxStock: 30,
    unit: 'unidades',
    stockValue: 250.00,
    turnoverRate: 4.1,
    daysOfStock: 15,
    status: 'low'
  },
  {
    productId: '3',
    productName: 'Mascarilla Gold',
    category: 'Mascarillas',
    currentStock: 2,
    minStock: 5,
    maxStock: 20,
    unit: 'unidades',
    stockValue: 160.00,
    turnoverRate: 2.8,
    daysOfStock: 8,
    status: 'critical'
  }
];

export const mockAssetReports: AssetReport[] = [
  {
    assetId: '1',
    assetName: 'Láser de Depilación IPL Pro',
    category: 'Equipos de Tratamiento',
    acquisitionCost: 15000.00,
    currentValue: 12000.00,
    depreciation: 20,
    maintenanceCosts: 800.00,
    utilizationRate: 85,
    nextMaintenance: '2024-03-15',
    status: 'excellent'
  },
  {
    assetId: '2',
    assetName: 'Camilla de Masajes Eléctrica',
    category: 'Mobiliario',
    acquisitionCost: 2500.00,
    currentValue: 1800.00,
    depreciation: 28,
    maintenanceCosts: 200.00,
    utilizationRate: 70,
    nextMaintenance: '2024-02-20',
    status: 'good'
  }
];

export const mockExpirationReports: ExpirationReport[] = [
  {
    productId: '1',
    productName: 'Crema Anti-edad Vitamin C',
    category: 'Cremas Faciales',
    batchNumber: 'VC2024001',
    expirationDate: '2024-02-28',
    daysUntilExpiration: 15,
    currentStock: 8,
    estimatedLoss: 640.00,
    recommendedAction: 'promote'
  },
  {
    productId: '2',
    productName: 'Suero Ácido Hialurónico',
    category: 'Sueros',
    batchNumber: 'AH2024002',
    expirationDate: '2024-02-15',
    daysUntilExpiration: 2,
    currentStock: 3,
    estimatedLoss: 270.00,
    recommendedAction: 'use_immediately'
  }
];

export const mockRevenueReports: RevenueReport[] = [
  {
    month: 'Enero',
    year: 2024,
    totalRevenue: 15000.00,
    serviceRevenue: 12000.00,
    productRevenue: 3000.00,
    averageTicket: 125.00,
    clientCount: 120,
    profitMargin: 65
  },
  {
    month: 'Febrero',
    year: 2024,
    totalRevenue: 18000.00,
    serviceRevenue: 14500.00,
    productRevenue: 3500.00,
    averageTicket: 135.00,
    clientCount: 133,
    profitMargin: 68
  },
  {
    month: 'Marzo',
    year: 2024,
    totalRevenue: 16500.00,
    serviceRevenue: 13200.00,
    productRevenue: 3300.00,
    averageTicket: 130.00,
    clientCount: 127,
    profitMargin: 63
  }
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalRevenue: 49500.00,
  totalCosts: 19730.00,
  profitMargin: 60.1,
  totalProducts: 156,
  lowStockItems: 12,
  expiringItems: 5,
  maintenanceDue: 3,
  topPerformingCategory: 'Tratamientos Faciales'
};
