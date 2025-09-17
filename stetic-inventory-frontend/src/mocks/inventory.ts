import type { InventoryItem, ConsumptionRecord } from "@/types/inventory";

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

export { mockInventoryItems, mockConsumptions };