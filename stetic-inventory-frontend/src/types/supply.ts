export type SupplyType = 'consumible' | 'reutilizable' | 'desechable';
export type SupplyStatus = 'disponible' | 'agotado' | 'por_vencer';

export interface Supply {
  id: string;
  name: string;
  category: string;
  type: SupplyType;
  description?: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  unit: string;
  supplier: string;
  lastPurchaseDate: string;
  expirationDate?: string;
  status: SupplyStatus;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyConsumption {
  id: string;
  supplyId: string;
  supplyName: string;
  serviceId?: string;
  serviceName?: string;
  quantityUsed: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  consumptionDate: string;
  performedBy: string;
  clientName?: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceSupply {
  id: string;
  serviceId: string;
  serviceName: string;
  supplyId: string;
  supplyName: string;
  requiredQuantity: number;
  unit: string;
  isOptional: boolean;
  notes?: string;
  createdAt: string;
}

export interface CreateSupplyData {
  name: string;
  category: string;
  type: SupplyType;
  description?: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  unit: string;
  supplier: string;
  lastPurchaseDate: string;
  expirationDate?: string;
  location: string;
}

export interface CreateConsumptionData {
  supplyId: string;
  serviceId?: string;
  serviceName?: string;
  quantityUsed: number;
  clientName?: string;
  notes?: string;
}

export interface SupplyFilters {
  search: string;
  category: string;
  type: SupplyType | '';
  supplier: string;
  status: SupplyStatus | '';
  location: string;
  showLowStock: boolean;
  showExpiring: boolean;
}

export interface SupplyCategory {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
}
