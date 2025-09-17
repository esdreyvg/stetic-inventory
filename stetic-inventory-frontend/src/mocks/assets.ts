import type { Asset, Maintenance, AssetCategory } from "@/types/asset";

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Láser de Depilación IPL Pro',
    category: 'Equipos de Tratamiento',
    description: 'Equipo de depilación láser IPL profesional',
    cost: 15000.00,
    purchaseDate: '2023-06-15',
    warrantyEndDate: '2025-06-15',
    serialNumber: 'IPL2023001',
    supplier: 'Beauty Tech Solutions',
    status: 'activo',
    location: 'Sala de Depilación',
    model: 'IPL Pro 3000',
    brand: 'BeautyTech',
    isActive: true,
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2023-06-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Camilla de Masajes Eléctrica',
    category: 'Mobiliario',
    description: 'Camilla eléctrica con ajuste de altura',
    cost: 2500.00,
    purchaseDate: '2023-08-10',
    warrantyEndDate: '2024-08-10',
    serialNumber: 'CAM2023002',
    supplier: 'Equipos Spa Pro',
    status: 'en_mantenimiento',
    location: 'Sala de Masajes',
    model: 'Comfort Pro',
    brand: 'SpaEquip',
    isActive: true,
    createdAt: '2023-08-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Vaporizador Facial',
    category: 'Equipos de Tratamiento',
    description: 'Vaporizador facial con ozono',
    cost: 800.00,
    purchaseDate: '2023-03-20',
    warrantyEndDate: '2024-03-20',
    serialNumber: 'VAP2023003',
    supplier: 'Beauty Supplies',
    status: 'activo',
    location: 'Sala de Tratamientos Faciales',
    model: 'Ozone Steamer',
    brand: 'FacialPro',
    isActive: true,
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2023-03-20T00:00:00Z'
  }
];

const mockMaintenances: Maintenance[] = [
  {
    id: '1',
    assetId: '2',
    assetName: 'Camilla de Masajes Eléctrica',
    type: 'preventivo',
    description: 'Revisión y lubricación del sistema eléctrico',
    scheduledDate: '2024-01-15',
    cost: 150.00,
    performedBy: 'Técnico Juan Pérez',
    notes: 'Se detectó desgaste en motor, reemplazar en próximo mantenimiento',
    isCompleted: true,
    completedDate: '2024-01-15',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    assetId: '1',
    assetName: 'Láser de Depilación IPL Pro',
    type: 'preventivo',
    description: 'Limpieza y calibración del láser',
    scheduledDate: '2024-02-10',
    cost: 300.00,
    performedBy: 'Especialista Beauty Tech',
    isCompleted: false,
    createdAt: '2024-01-20T00:00:00Z'
  }
];

const mockCategories: AssetCategory[] = [
  { id: '1', name: 'Equipos de Tratamiento' },
  { id: '2', name: 'Mobiliario' },
  { id: '3', name: 'Equipos de Limpieza' },
  { id: '4', name: 'Herramientas' },
  { id: '5', name: 'Tecnología' }
];

export { mockAssets, mockMaintenances, mockCategories };