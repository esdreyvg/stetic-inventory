import type { 
  InventoryItem, 
  ConsumptionRecord, 
  CreateConsumptionData, 
  InventoryFilters, 
  InventoryAlert,
  CreateInventoryItemData,
  InventoryType 
} from '@/types/inventory';

// Mock data for development
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Shampoo Hidratante Premium',
    productCode: 'SHP001',
    category: 'Cuidado Capilar',
    type: 'service',
    totalQuantity: 3,
    availableQuantity: 2,
    openedQuantity: 1,
    unit: 'botella',
    unitSize: 500,
    purchasePrice: 25.00,
    supplier: 'Beauty Pro',
    location: 'Almacén Principal',
    batchNumber: 'BP2024001',
    expirationDate: '2025-06-15',
    purchaseDate: '2024-01-15',
    status: 'opened',
    minStock: 2,
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '2',
    productId: '2',
    productName: 'Crema Facial Antiarrugas',
    productCode: 'CFA002',
    category: 'Cuidado Facial',
    type: 'resale',
    totalQuantity: 15,
    availableQuantity: 15,
    openedQuantity: 0,
    unit: 'unidad',
    unitSize: 50,
    purchasePrice: 35.00,
    salePrice: 65.00,
    supplier: 'Laboratorios Bella',
    location: 'Vitrina de Ventas',
    batchNumber: 'LB2024005',
    expirationDate: '2024-03-30',
    purchaseDate: '2024-01-10',
    status: 'sealed',
    minStock: 5,
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    productId: '3',
    productName: 'Aceite de Masaje Relajante',
    productCode: 'AMR003',
    category: 'Masajes',
    type: 'service',
    totalQuantity: 1,
    availableQuantity: 0,
    openedQuantity: 1,
    unit: 'botella',
    unitSize: 1000,
    purchasePrice: 45.00,
    supplier: 'Aromas Naturales',
    location: 'Sala de Masajes',
    batchNumber: 'AN2024003',
    expirationDate: '2025-12-31',
    purchaseDate: '2024-01-08',
    status: 'opened',
    minStock: 1,
    isActive: true,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  }
];

const mockConsumptions: ConsumptionRecord[] = [
  {
    id: '1',
    inventoryItemId: '1',
    productName: 'Shampoo Hidratante Premium',
    consumedQuantity: 50,
    unit: 'ml',
    reason: 'Servicio de lavado',
    serviceType: 'Lavado y peinado',
    clientName: 'María García',
    performedBy: 'Ana López',
    consumedAt: '2024-01-20T14:30:00Z',
    notes: 'Cliente con cabello graso'
  },
  {
    id: '2',
    inventoryItemId: '3',
    productName: 'Aceite de Masaje Relajante',
    consumedQuantity: 30,
    unit: 'ml',
    reason: 'Masaje relajante',
    serviceType: 'Masaje corporal',
    clientName: 'Carlos Ruiz',
    performedBy: 'Laura Martín',
    consumedAt: '2024-01-22T16:45:00Z',
    notes: 'Masaje de 60 minutos'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const inventoryService = {
  // Get inventory items with filters
  async getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]> {
    await delay(500);
    
    let filteredItems = [...mockInventoryItems];
    
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.productName.toLowerCase().includes(searchLower) ||
          item.productCode.toLowerCase().includes(searchLower) ||
          item.batchNumber?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.category) {
        filteredItems = filteredItems.filter(item => item.category === filters.category);
      }
      
      if (filters.supplier) {
        filteredItems = filteredItems.filter(item => item.supplier === filters.supplier);
      }
      
      if (filters.status) {
        filteredItems = filteredItems.filter(item => item.status === filters.status);
      }
      
      if (filters.location) {
        filteredItems = filteredItems.filter(item => item.location === filters.location);
      }
      
      if (filters.type) {
        filteredItems = filteredItems.filter(item => item.type === filters.type);
      }
      
      if (filters.showExpiringSoon) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        filteredItems = filteredItems.filter(item => {
          if (!item.expirationDate) return false;
          return new Date(item.expirationDate) <= thirtyDaysFromNow;
        });
      }
      
      if (filters.showLowStock) {
        filteredItems = filteredItems.filter(item => 
          item.availableQuantity <= item.minStock
        );
      }
    }
    
    return filteredItems;
  },

  // Get inventory items by type
  async getInventoryItemsByType(type: InventoryType): Promise<InventoryItem[]> {
    await delay(300);
    return mockInventoryItems.filter(item => item.type === type);
  },

  // Create consumption record
  async createConsumption(data: CreateConsumptionData): Promise<ConsumptionRecord> {
    await delay(800);
    
    const inventoryItem = mockInventoryItems.find(item => item.id === data.inventoryItemId);
    if (!inventoryItem) {
      throw new Error('Item de inventario no encontrado');
    }
    
    // Calculate consumption in unit terms
    const consumedInUnits = data.consumedQuantity / inventoryItem.unitSize;
    
    if (inventoryItem.availableQuantity < consumedInUnits) {
      throw new Error('Cantidad insuficiente en inventario');
    }
    
    // Update inventory
    inventoryItem.availableQuantity -= consumedInUnits;
    inventoryItem.openedQuantity += consumedInUnits;
    inventoryItem.updatedAt = new Date().toISOString();
    
    // Update status if needed
    if (inventoryItem.availableQuantity === 0) {
      inventoryItem.status = 'out_of_stock';
    } else if (inventoryItem.status === 'sealed') {
      inventoryItem.status = 'opened';
    }
    
    const newConsumption: ConsumptionRecord = {
      id: Date.now().toString(),
      ...data,
      productName: inventoryItem.productName,
      unit: 'ml', // Convert to ml for consumption tracking
      performedBy: 'Usuario Actual', // In real app, get from auth context
      consumedAt: new Date().toISOString()
    };
    
    mockConsumptions.push(newConsumption);
    return newConsumption;
  },

  // Get consumption history
  async getConsumptions(inventoryItemId?: string): Promise<ConsumptionRecord[]> {
    await delay(300);
    
    if (inventoryItemId) {
      return mockConsumptions.filter(c => c.inventoryItemId === inventoryItemId);
    }
    
    return [...mockConsumptions];
  },

  // Get inventory alerts
  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    await delay(300);
    
    const alerts: InventoryAlert[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    mockInventoryItems.forEach(item => {
      // Check expiration
      if (item.expirationDate) {
        const expirationDate = new Date(item.expirationDate);
        
        if (expirationDate < now) {
          alerts.push({
            id: `exp-${item.id}`,
            type: 'expired',
            severity: 'critical',
            inventoryItemId: item.id,
            productName: item.productName,
            message: `Producto expirado desde ${expirationDate.toLocaleDateString()}`,
            createdAt: now.toISOString()
          });
        } else if (expirationDate <= thirtyDaysFromNow) {
          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({
            id: `exp-soon-${item.id}`,
            type: 'expiration',
            severity: daysUntilExpiration <= 7 ? 'high' : 'medium',
            inventoryItemId: item.id,
            productName: item.productName,
            message: `Expira en ${daysUntilExpiration} días`,
            createdAt: now.toISOString()
          });
        }
      }
      
      // Check low stock
      if (item.availableQuantity <= 0) {
        alerts.push({
          id: `out-${item.id}`,
          type: 'out_of_stock',
          severity: 'critical',
          inventoryItemId: item.id,
          productName: item.productName,
          message: 'Sin stock disponible',
          createdAt: now.toISOString()
        });
      } else if (item.availableQuantity <= item.minStock) {
        alerts.push({
          id: `low-${item.id}`,
          type: 'low_stock',
          severity: 'medium',
          inventoryItemId: item.id,
          productName: item.productName,
          message: `Stock bajo: ${item.availableQuantity} ${item.unit}(s)`,
          createdAt: now.toISOString()
        });
      }
    });
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  },

  // Add new inventory item
  async createInventoryItem(data: CreateInventoryItemData): Promise<InventoryItem> {
    await delay(800);
    
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      ...data,
      productName: `Producto ${data.productId}`, // In real app, fetch from product service
      productCode: `CODE${data.productId}`,
      category: 'General',
      availableQuantity: data.totalQuantity,
      openedQuantity: 0,
      status: 'sealed',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockInventoryItems.push(newItem);
    return newItem;
  },

  // Update inventory item
  async updateInventoryItem(id: string, data: Partial<CreateInventoryItemData>): Promise<InventoryItem> {
    await delay(500);
    
    const index = mockInventoryItems.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item de inventario no encontrado');
    }
    
    const updatedItem: InventoryItem = {
      ...mockInventoryItems[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    mockInventoryItems[index] = updatedItem;
    return updatedItem;
  },

  // Get unique locations
  async getLocations(): Promise<string[]> {
    await delay(200);
    const locations = [...new Set(mockInventoryItems.map(item => item.location))];
    return locations.sort();
  }
};
