import type { 
  Asset, 
  Maintenance, 
  CreateAssetData, 
  CreateMaintenanceData, 
  AssetFilters, 
  AssetCategory, 
  MaintenanceAlert,
  AssetStatus 
} from '@/types/asset';
// Mock data for development
import { mockAssets, mockMaintenances, mockCategories } from '@/mocks/assets';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const assetService = {
  // Get all assets with filters
  async getAssets(filters?: AssetFilters): Promise<Asset[]> {
    await delay(500);
    
    let filteredAssets = [...mockAssets];
    
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAssets = filteredAssets.filter(asset =>
          asset.name.toLowerCase().includes(searchLower) ||
          asset.brand?.toLowerCase().includes(searchLower) ||
          asset.model?.toLowerCase().includes(searchLower) ||
          asset.serialNumber?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.category) {
        filteredAssets = filteredAssets.filter(asset => asset.category === filters.category);
      }
      
      if (filters.supplier) {
        filteredAssets = filteredAssets.filter(asset => asset.supplier === filters.supplier);
      }
      
      if (filters.status) {
        filteredAssets = filteredAssets.filter(asset => asset.status === filters.status);
      }
      
      if (filters.location) {
        filteredAssets = filteredAssets.filter(asset => asset.location === filters.location);
      }
      
      if (filters.showWarrantyExpiring) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        filteredAssets = filteredAssets.filter(asset => {
          if (!asset.warrantyEndDate) return false;
          return new Date(asset.warrantyEndDate) <= thirtyDaysFromNow;
        });
      }
      
      if (filters.showMaintenanceDue) {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        
        filteredAssets = filteredAssets.filter(asset => {
          const assetMaintenances = mockMaintenances.filter(m => 
            m.assetId === asset.id && !m.isCompleted
          );
          return assetMaintenances.some(m => 
            new Date(m.scheduledDate) <= sevenDaysFromNow
          );
        });
      }
    }
    
    return filteredAssets;
  },

  // Get single asset by ID
  async getAsset(id: string): Promise<Asset | null> {
    await delay(300);
    return mockAssets.find(asset => asset.id === id) || null;
  },

  // Create new asset
  async createAsset(data: CreateAssetData): Promise<Asset> {
    await delay(800);
    
    const newAsset: Asset = {
      id: Date.now().toString(),
      ...data,
      status: 'activo',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockAssets.push(newAsset);
    return newAsset;
  },

  // Update existing asset
  async updateAsset(id: string, data: Partial<CreateAssetData>): Promise<Asset> {
    await delay(800);
    
    const index = mockAssets.findIndex(asset => asset.id === id);
    if (index === -1) {
      throw new Error('Activo no encontrado');
    }
    
    const updatedAsset: Asset = {
      ...mockAssets[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    mockAssets[index] = updatedAsset;
    return updatedAsset;
  },

  // Update asset status
  async updateAssetStatus(id: string, status: AssetStatus): Promise<Asset> {
    await delay(500);
    
    const index = mockAssets.findIndex(asset => asset.id === id);
    if (index === -1) {
      throw new Error('Activo no encontrado');
    }
    
    mockAssets[index] = {
      ...mockAssets[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return mockAssets[index];
  },

  // Get maintenances for an asset
  async getMaintenances(assetId?: string): Promise<Maintenance[]> {
    await delay(300);
    
    if (assetId) {
      return mockMaintenances.filter(m => m.assetId === assetId);
    }
    
    return [...mockMaintenances];
  },

  // Create new maintenance
  async createMaintenance(data: CreateMaintenanceData): Promise<Maintenance> {
    await delay(800);
    
    const asset = mockAssets.find(a => a.id === data.assetId);
    if (!asset) {
      throw new Error('Activo no encontrado');
    }
    
    const newMaintenance: Maintenance = {
      id: Date.now().toString(),
      ...data,
      assetName: asset.name,
      performedBy: 'Usuario Actual', // In real app, get from auth context
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    
    mockMaintenances.push(newMaintenance);
    return newMaintenance;
  },

  // Complete maintenance
  async completeMaintenance(id: string, notes?: string): Promise<Maintenance> {
    await delay(500);
    
    const index = mockMaintenances.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Mantenimiento no encontrado');
    }
    
    mockMaintenances[index] = {
      ...mockMaintenances[index],
      isCompleted: true,
      completedDate: new Date().toISOString(),
      notes: notes || mockMaintenances[index].notes
    };
    
    return mockMaintenances[index];
  },

  // Get asset categories
  async getCategories(): Promise<AssetCategory[]> {
    await delay(300);
    return [...mockCategories];
  },

  // Get maintenance alerts
  async getMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    await delay(300);
    
    const alerts: MaintenanceAlert[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    // Check for warranty expiration
    mockAssets.forEach(asset => {
      if (asset.warrantyEndDate) {
        const warrantyDate = new Date(asset.warrantyEndDate);
        
        if (warrantyDate < now) {
          alerts.push({
            id: `warranty-expired-${asset.id}`,
            type: 'warranty_expired',
            severity: 'medium',
            assetId: asset.id,
            assetName: asset.name,
            message: `Garantía expirada`,
            dueDate: asset.warrantyEndDate,
            createdAt: now.toISOString()
          });
        } else if (warrantyDate <= thirtyDaysFromNow) {
          const daysUntilExpiry = Math.ceil((warrantyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({
            id: `warranty-expiring-${asset.id}`,
            type: 'warranty_expiring',
            severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
            assetId: asset.id,
            assetName: asset.name,
            message: `Garantía expira en ${daysUntilExpiry} días`,
            dueDate: asset.warrantyEndDate,
            createdAt: now.toISOString()
          });
        }
      }
    });
    
    // Check for maintenance due
    mockMaintenances.forEach(maintenance => {
      if (!maintenance.isCompleted) {
        const maintenanceDate = new Date(maintenance.scheduledDate);
        const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilMaintenance <= 7) {
          alerts.push({
            id: `maintenance-due-${maintenance.id}`,
            type: 'maintenance_due',
            severity: daysUntilMaintenance <= 0 ? 'critical' : 'high',
            assetId: maintenance.assetId,
            assetName: maintenance.assetName,
            message: daysUntilMaintenance <= 0 
              ? 'Mantenimiento vencido' 
              : `Mantenimiento en ${daysUntilMaintenance} días`,
            dueDate: maintenance.scheduledDate,
            createdAt: now.toISOString()
          });
        }
      }
    });
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  },

  // Get unique suppliers
  async getSuppliers(): Promise<string[]> {
    await delay(200);
    const suppliers = [...new Set(mockAssets.map(asset => asset.supplier))];
    return suppliers.sort();
  },

  // Get unique locations
  async getLocations(): Promise<string[]> {
    await delay(200);
    const locations = [...new Set(mockAssets.map(asset => asset.location))];
    return locations.sort();
  }
};
