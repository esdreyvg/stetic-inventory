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
import { mockInventoryItems, mockConsumptions } from '@/mocks/inventory';

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
