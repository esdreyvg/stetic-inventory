export type InventoryType = 'service' | 'resale';
export type ItemStatus = 'sealed' | 'opened' | 'expired' | 'out_of_stock';

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  type: InventoryType;
  totalQuantity: number;
  availableQuantity: number;
  openedQuantity: number;
  unit: string;
  unitSize: number; // Size of each unit (e.g., 500ml bottle)
  purchasePrice: number;
  salePrice?: number; // Only for resale items
  supplier: string;
  location: string;
  batchNumber?: string;
  expirationDate?: string;
  purchaseDate: string;
  status: ItemStatus;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumptionRecord {
  id: string;
  inventoryItemId: string;
  productName: string;
  consumedQuantity: number;
  unit: string;
  reason: string;
  serviceType?: string;
  clientName?: string;
  performedBy: string;
  consumedAt: string;
  notes?: string;
}

export interface CreateConsumptionData {
  inventoryItemId: string;
  consumedQuantity: number;
  reason: string;
  serviceType?: string;
  clientName?: string;
  notes?: string;
}

export interface InventoryFilters {
  search: string;
  category: string;
  supplier: string;
  status: ItemStatus | '';
  location: string;
  type: InventoryType | '';
  showExpiringSoon: boolean;
  showLowStock: boolean;
}

export interface InventoryAlert {
  id: string;
  type: 'expiration' | 'low_stock' | 'expired' | 'out_of_stock';
  severity: 'low' | 'medium' | 'high' | 'critical';
  inventoryItemId: string;
  productName: string;
  message: string;
  createdAt: string;
}

export interface CreateInventoryItemData {
  productId: string;
  totalQuantity: number;
  unit: string;
  unitSize: number;
  purchasePrice: number;
  salePrice?: number;
  supplier: string;
  location: string;
  batchNumber?: string;
  expirationDate?: string;
  purchaseDate: string;
  type: InventoryType;
  minStock: number;
}
