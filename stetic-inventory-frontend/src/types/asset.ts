export type AssetStatus = 'activo' | 'en_mantenimiento' | 'dado_de_baja';
export type MaintenanceType = 'preventivo' | 'correctivo' | 'revision';

export interface Asset {
  id: string;
  name: string;
  category: string;
  description?: string;
  cost: number;
  purchaseDate: string;
  warrantyEndDate?: string;
  serialNumber?: string;
  supplier: string;
  status: AssetStatus;
  location: string;
  model?: string;
  brand?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  assetId: string;
  assetName: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  performedBy: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateAssetData {
  name: string;
  category: string;
  description?: string;
  cost: number;
  purchaseDate: string;
  warrantyEndDate?: string;
  serialNumber?: string;
  supplier: string;
  location: string;
  model?: string;
  brand?: string;
}

export interface CreateMaintenanceData {
  assetId: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  cost: number;
  notes?: string;
}

export interface AssetFilters {
  search: string;
  category: string;
  supplier: string;
  status: AssetStatus | '';
  location: string;
  showWarrantyExpiring: boolean;
  showMaintenanceDue: boolean;
}

export interface AssetCategory {
  id: string;
  name: string;
}

export interface MaintenanceAlert {
  id: string;
  type: 'maintenance_due' | 'warranty_expiring' | 'warranty_expired';
  severity: 'low' | 'medium' | 'high' | 'critical';
  assetId: string;
  assetName: string;
  message: string;
  dueDate: string;
  createdAt: string;
}
