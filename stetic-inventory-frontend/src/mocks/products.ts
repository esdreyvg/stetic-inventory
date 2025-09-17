import type { Product, ProductCategory, Supplier } from "@/types/product";

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Crema Hidratante Facial',
    code: 'CHF001',
    category: 'Cuidado Facial',
    unit: 'unidad',
    price: 45.99,
    supplier: 'Laboratorios Bella',
    description: 'Crema hidratante para todo tipo de piel',
    stock: 25,
    minStock: 5,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Serum Vitamina C',
    code: 'SVC002',
    category: 'Cuidado Facial',
    unit: 'ml',
    price: 89.99,
    supplier: 'Beauty Pro',
    description: 'Serum antioxidante con vitamina C',
    stock: 15,
    minStock: 3,
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Aceite de Masaje Relajante',
    code: 'AMR003',
    category: 'Masajes',
    unit: 'litro',
    price: 35.50,
    supplier: 'Aromas Naturales',
    description: 'Aceite natural para masajes relajantes',
    stock: 8,
    minStock: 2,
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

const mockCategories: ProductCategory[] = [
  { id: '1', name: 'Cuidado Facial' },
  { id: '2', name: 'Cuidado Corporal' },
  { id: '3', name: 'Masajes' },
  { id: '4', name: 'Tratamientos' },
  { id: '5', name: 'Limpieza' }
];

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Laboratorios Bella', contact: 'contacto@bella.com' },
  { id: '2', name: 'Beauty Pro', contact: 'ventas@beautypro.com' },
  { id: '3', name: 'Aromas Naturales', contact: 'info@aromas.com' },
  { id: '4', name: 'Cosméticos Elite', contact: 'pedidos@elite.com' }
];

export { mockProducts, mockCategories, mockSuppliers };