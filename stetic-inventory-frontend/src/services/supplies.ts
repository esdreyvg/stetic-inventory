import type { 
  Supply, 
  SupplyConsumption, 
  ServiceSupply,
  CreateSupplyData, 
  CreateConsumptionData, 
  SupplyFilters, 
  SupplyCategory,
  Service
} from '@/types/supply';
import { 
  mockSupplies, 
  mockSupplyConsumptions, 
  mockServiceSupplies,
  mockSupplyCategories,
  mockServices 
} from '@/mocks/supplies';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const supplyService = {
  // Get all supplies with filters
  async getSupplies(filters?: SupplyFilters): Promise<Supply[]> {
    await delay(500);
    
    let filteredSupplies = [...mockSupplies];
    
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredSupplies = filteredSupplies.filter(supply =>
          supply.name.toLowerCase().includes(searchLower) ||
          supply.description?.toLowerCase().includes(searchLower) ||
          supply.supplier.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.category) {
        filteredSupplies = filteredSupplies.filter(supply => supply.category === filters.category);
      }
      
      if (filters.type) {
        filteredSupplies = filteredSupplies.filter(supply => supply.type === filters.type);
      }
      
      if (filters.supplier) {
        filteredSupplies = filteredSupplies.filter(supply => supply.supplier === filters.supplier);
      }
      
      if (filters.status) {
        filteredSupplies = filteredSupplies.filter(supply => supply.status === filters.status);
      }
      
      if (filters.location) {
        filteredSupplies = filteredSupplies.filter(supply => supply.location === filters.location);
      }
      
      if (filters.showLowStock) {
        filteredSupplies = filteredSupplies.filter(supply => 
          supply.currentStock <= supply.minStock
        );
      }
      
      if (filters.showExpiring) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        filteredSupplies = filteredSupplies.filter(supply => {
          if (!supply.expirationDate) return false;
          return new Date(supply.expirationDate) <= thirtyDaysFromNow;
        });
      }
    }
    
    return filteredSupplies;
  },

  // Get single supply by ID
  async getSupply(id: string): Promise<Supply | null> {
    await delay(300);
    return mockSupplies.find(supply => supply.id === id) || null;
  },

  // Create new supply
  async createSupply(data: CreateSupplyData): Promise<Supply> {
    await delay(800);
    
    // Determine status based on stock and expiration
    let status: Supply['status'] = 'disponible';
    if (data.currentStock <= data.minStock) {
      status = 'agotado';
    } else if (data.expirationDate) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      if (new Date(data.expirationDate) <= thirtyDaysFromNow) {
        status = 'por_vencer';
      }
    }
    
    const newSupply: Supply = {
      id: Date.now().toString(),
      ...data,
      status,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockSupplies.push(newSupply);
    return newSupply;
  },

  // Update existing supply
  async updateSupply(id: string, data: Partial<CreateSupplyData>): Promise<Supply> {
    await delay(800);
    
    const index = mockSupplies.findIndex(supply => supply.id === id);
    if (index === -1) {
      throw new Error('Insumo no encontrado');
    }
    
    const updatedSupply: Supply = {
      ...mockSupplies[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Update status
    if (updatedSupply.currentStock <= updatedSupply.minStock) {
      updatedSupply.status = 'agotado';
    } else if (updatedSupply.expirationDate) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      if (new Date(updatedSupply.expirationDate) <= thirtyDaysFromNow) {
        updatedSupply.status = 'por_vencer';
      } else {
        updatedSupply.status = 'disponible';
      }
    } else {
      updatedSupply.status = 'disponible';
    }
    
    mockSupplies[index] = updatedSupply;
    return updatedSupply;
  },

  // Create consumption record
  async createConsumption(data: CreateConsumptionData): Promise<SupplyConsumption> {
    await delay(800);
    
    const supply = mockSupplies.find(s => s.id === data.supplyId);
    if (!supply) {
      throw new Error('Insumo no encontrado');
    }
    
    if (supply.currentStock < data.quantityUsed) {
      throw new Error('Stock insuficiente');
    }
    
    // Update supply stock
    supply.currentStock -= data.quantityUsed;
    supply.updatedAt = new Date().toISOString();
    
    // Update status if needed
    if (supply.currentStock <= supply.minStock) {
      supply.status = 'agotado';
    }
    
    const newConsumption: SupplyConsumption = {
      id: Date.now().toString(),
      ...data,
      supplyName: supply.name,
      unit: supply.unit,
      unitCost: supply.unitCost,
      totalCost: data.quantityUsed * supply.unitCost,
      consumptionDate: new Date().toISOString().split('T')[0],
      performedBy: 'Usuario Actual', // In real app, get from auth context
      createdAt: new Date().toISOString()
    };
    
    mockSupplyConsumptions.push(newConsumption);
    return newConsumption;
  },

  // Get consumption history
  async getConsumptions(supplyId?: string): Promise<SupplyConsumption[]> {
    await delay(300);
    
    if (supplyId) {
      return mockSupplyConsumptions.filter(c => c.supplyId === supplyId);
    }
    
    return [...mockSupplyConsumptions].sort((a, b) => 
      new Date(b.consumptionDate).getTime() - new Date(a.consumptionDate).getTime()
    );
  },

  // Get service supplies (insumos associated with services)
  async getServiceSupplies(serviceId?: string): Promise<ServiceSupply[]> {
    await delay(300);
    
    if (serviceId) {
      return mockServiceSupplies.filter(ss => ss.serviceId === serviceId);
    }
    
    return [...mockServiceSupplies];
  },

  // Get supply categories
  async getCategories(): Promise<SupplyCategory[]> {
    await delay(300);
    return [...mockSupplyCategories];
  },

  // Get services
  async getServices(): Promise<Service[]> {
    await delay(300);
    return [...mockServices];
  },

  // Get unique suppliers
  async getSuppliers(): Promise<string[]> {
    await delay(200);
    const suppliers = [...new Set(mockSupplies.map(supply => supply.supplier))];
    return suppliers.sort();
  },

  // Get unique locations
  async getLocations(): Promise<string[]> {
    await delay(200);
    const locations = [...new Set(mockSupplies.map(supply => supply.location))];
    return locations.sort();
  },

  // Update supply stock
  async updateStock(id: string, newStock: number): Promise<Supply> {
    await delay(500);
    
    const index = mockSupplies.findIndex(supply => supply.id === id);
    if (index === -1) {
      throw new Error('Insumo no encontrado');
    }
    
    mockSupplies[index] = {
      ...mockSupplies[index],
      currentStock: newStock,
      updatedAt: new Date().toISOString()
    };
    
    // Update status
    if (newStock <= mockSupplies[index].minStock) {
      mockSupplies[index].status = 'agotado';
    } else {
      mockSupplies[index].status = 'disponible';
    }
    
    return mockSupplies[index];
  }
};
