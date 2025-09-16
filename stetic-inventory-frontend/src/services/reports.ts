import type { 
  MonthlyCostReport, 
  SupplierRanking, 
  ConsumptionReport, 
  StockReport, 
  AssetReport, 
  ExpirationReport,
  RevenueReport,
  DashboardMetrics,
  ReportFilters 
} from '@/types/report';
import { 
  mockMonthlyCostReports, 
  mockSupplierRankings, 
  mockConsumptionReports, 
  mockStockReports, 
  mockAssetReports, 
  mockExpirationReports,
  mockRevenueReports,
  mockDashboardMetrics 
} from '@/mocks/reports';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const reportService = {
  // Get monthly cost reports
  async getMonthlyCostReports(filters?: ReportFilters): Promise<MonthlyCostReport[]> {
    await delay(800);
    return [...mockMonthlyCostReports];
  },

  // Get supplier rankings
  async getSupplierRankings(): Promise<SupplierRanking[]> {
    await delay(600);
    return [...mockSupplierRankings];
  },

  // Get consumption reports
  async getConsumptionReports(filters?: ReportFilters): Promise<ConsumptionReport[]> {
    await delay(700);
    return [...mockConsumptionReports];
  },

  // Get stock reports
  async getStockReports(): Promise<StockReport[]> {
    await delay(600);
    return [...mockStockReports];
  },

  // Get asset reports
  async getAssetReports(): Promise<AssetReport[]> {
    await delay(700);
    return [...mockAssetReports];
  },

  // Get expiration reports
  async getExpirationReports(): Promise<ExpirationReport[]> {
    await delay(500);
    return [...mockExpirationReports];
  },

  // Get revenue reports
  async getRevenueReports(filters?: ReportFilters): Promise<RevenueReport[]> {
    await delay(800);
    return [...mockRevenueReports];
  },

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await delay(400);
    return { ...mockDashboardMetrics };
  },

  // Export to CSV
  async exportToCSV(reportType: string, data: any[]): Promise<string> {
    await delay(1000);
    
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  },

  // Export to PDF (mock implementation)
  async exportToPDF(reportType: string, data: any[]): Promise<Blob> {
    await delay(1500);
    
    // In a real implementation, you would use a library like jsPDF
    const content = `Reporte de ${reportType}\n\nGenerado el: ${new Date().toLocaleDateString()}\n\nDatos: ${JSON.stringify(data, null, 2)}`;
    return new Blob([content], { type: 'application/pdf' });
  }
};
