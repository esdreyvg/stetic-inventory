import type { Supply, SupplyConsumption, ServiceSupply, SupplyCategory, Service } from '@/types/supply';

export const mockSupplies: Supply[] = [
  {
    id: '1',
    name: 'Guantes de Nitrilo Talla M',
    category: 'Protección Personal',
    type: 'desechable',
    description: 'Guantes desechables de nitrilo, libres de polvo',
    currentStock: 450,
    minStock: 100,
    unitCost: 0.25,
    unit: 'unidad',
    supplier: 'Medical Supplies Co.',
    lastPurchaseDate: '2024-01-15',
    expirationDate: '2026-01-15',
    status: 'disponible',
    location: 'Almacén Principal',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Batas Desechables',
    category: 'Vestimenta',
    type: 'desechable',
    description: 'Batas protectoras desechables',
    currentStock: 75,
    minStock: 50,
    unitCost: 2.50,
    unit: 'unidad',
    supplier: 'SpaWear Solutions',
    lastPurchaseDate: '2024-01-20',
    status: 'disponible',
    location: 'Almacén Secundario',
    isActive: true,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Toallas de Microfibra',
    category: 'Textiles',
    type: 'reutilizable',
    description: 'Toallas de microfibra para tratamientos faciales',
    currentStock: 25,
    minStock: 30,
    unitCost: 8.00,
    unit: 'unidad',
    supplier: 'Textile Pro',
    lastPurchaseDate: '2023-12-10',
    status: 'agotado',
    location: 'Sala de Tratamientos',
    isActive: true,
    createdAt: '2023-12-10T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  },
  {
    id: '4',
    name: 'Algodón Hidrófilo',
    category: 'Materiales de Limpieza',
    type: 'consumible',
    description: 'Algodón esterilizado para limpieza',
    currentStock: 15,
    minStock: 20,
    unitCost: 3.50,
    unit: 'paquete',
    supplier: 'Clean Supplies',
    lastPurchaseDate: '2024-01-05',
    expirationDate: '2024-03-15',
    status: 'por_vencer',
    location: 'Almacén Principal',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  }
];

export const mockSupplyConsumptions: SupplyConsumption[] = [
  {
    id: '1',
    supplyId: '1',
    supplyName: 'Guantes de Nitrilo Talla M',
    serviceId: 'service_1',
    serviceName: 'Limpieza Facial',
    quantityUsed: 2,
    unit: 'unidad',
    unitCost: 0.25,
    totalCost: 0.50,
    consumptionDate: '2024-01-22',
    performedBy: 'Ana López',
    clientName: 'María García',
    notes: 'Tratamiento facial completo',
    createdAt: '2024-01-22T14:30:00Z'
  },
  {
    id: '2',
    supplyId: '2',
    supplyName: 'Batas Desechables',
    serviceId: 'service_2',
    serviceName: 'Masaje Corporal',
    quantityUsed: 1,
    unit: 'unidad',
    unitCost: 2.50,
    totalCost: 2.50,
    consumptionDate: '2024-01-22',
    performedBy: 'Laura Martín',
    clientName: 'Carlos Ruiz',
    notes: 'Masaje relajante de 60 minutos',
    createdAt: '2024-01-22T16:45:00Z'
  },
  {
    id: '3',
    supplyId: '3',
    supplyName: 'Toallas de Microfibra',
    serviceId: 'service_1',
    serviceName: 'Limpieza Facial',
    quantityUsed: 2,
    unit: 'unidad',
    unitCost: 8.00,
    totalCost: 16.00,
    consumptionDate: '2024-01-21',
    performedBy: 'Ana López',
    clientName: 'Sofia Mendez',
    notes: 'Tratamiento anti-edad',
    createdAt: '2024-01-21T10:15:00Z'
  }
];

export const mockServiceSupplies: ServiceSupply[] = [
  {
    id: '1',
    serviceId: 'service_1',
    serviceName: 'Limpieza Facial',
    supplyId: '1',
    supplyName: 'Guantes de Nitrilo Talla M',
    requiredQuantity: 2,
    unit: 'unidad',
    isOptional: false,
    notes: 'Obligatorio para higiene',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    serviceId: 'service_1',
    serviceName: 'Limpieza Facial',
    supplyId: '3',
    supplyName: 'Toallas de Microfibra',
    requiredQuantity: 2,
    unit: 'unidad',
    isOptional: false,
    notes: 'Para secar el rostro',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    serviceId: 'service_2',
    serviceName: 'Masaje Corporal',
    supplyId: '2',
    supplyName: 'Batas Desechables',
    requiredQuantity: 1,
    unit: 'unidad',
    isOptional: true,
    notes: 'Para protección del cliente',
    createdAt: '2024-01-15T00:00:00Z'
  }
];

export const mockSupplyCategories: SupplyCategory[] = [
  { id: '1', name: 'Protección Personal' },
  { id: '2', name: 'Vestimenta' },
  { id: '3', name: 'Textiles' },
  { id: '4', name: 'Materiales de Limpieza' },
  { id: '5', name: 'Desinfectantes' },
  { id: '6', name: 'Herramientas' }
];

export const mockServices: Service[] = [
  { id: 'service_1', name: 'Limpieza Facial', category: 'Tratamientos Faciales' },
  { id: 'service_2', name: 'Masaje Corporal', category: 'Masajes' },
  { id: 'service_3', name: 'Depilación', category: 'Depilación' },
  { id: 'service_4', name: 'Manicure', category: 'Manicure y Pedicure' },
  { id: 'service_5', name: 'Pedicure', category: 'Manicure y Pedicure' }
];
