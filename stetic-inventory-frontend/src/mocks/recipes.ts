import type { Product } from "@/types/product";
import type { Recipe, RecipeCategory, ServiceType } from "@/types/recipe";

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Tratamiento Hidratante Facial Básico',
    description: 'Tratamiento facial hidratante para todo tipo de piel',
    category: 'Tratamientos Faciales',
    serviceType: 'Limpieza e Hidratación',
    estimatedDuration: 60,
    difficulty: 'facil',
    ingredients: [
      {
        id: '1',
        productId: '1',
        productName: 'Crema Hidratante Facial',
        productCode: 'CHF001',
        requiredQuantity: 15,
        unit: 'ml',
        unitCost: 0.92,
        totalCost: 13.80,
        isVariable: true,
        minQuantity: 10,
        maxQuantity: 25,
        notes: 'Aplicar según tipo de piel'
      },
      {
        id: '2',
        productId: '2',
        productName: 'Tónico Facial',
        productCode: 'TF002',
        requiredQuantity: 10,
        unit: 'ml',
        unitCost: 0.45,
        totalCost: 4.50,
        isVariable: false,
        notes: 'Cantidad fija para limpieza'
      }
    ],
    instructions: [
      'Limpiar el rostro con agua tibia',
      'Aplicar tónico facial con algodón',
      'Masajear suavemente la crema hidratante',
      'Dejar actuar por 15 minutos',
      'Retirar exceso con toalla húmeda'
    ],
    totalCost: 18.30,
    suggestedPrice: 45.00,
    profitMargin: 59.33,
    isActive: true,
    createdBy: 'admin',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    version: 1
  },
  {
    id: '2',
    name: 'Masaje Relajante con Aceites',
    description: 'Masaje corporal relajante con aceites esenciales',
    category: 'Masajes',
    serviceType: 'Masaje Corporal',
    estimatedDuration: 90,
    difficulty: 'intermedio',
    ingredients: [
      {
        id: '3',
        productId: '3',
        productName: 'Aceite de Masaje Relajante',
        productCode: 'AMR003',
        requiredQuantity: 30,
        unit: 'ml',
        unitCost: 0.045,
        totalCost: 1.35,
        isVariable: true,
        minQuantity: 25,
        maxQuantity: 40,
        notes: 'Ajustar según zona del cuerpo'
      },
      {
        id: '4',
        productId: '4',
        productName: 'Aceite Esencial Lavanda',
        productCode: 'AEL004',
        requiredQuantity: 3,
        unit: 'gotas',
        unitCost: 0.25,
        totalCost: 0.75,
        isVariable: false,
        notes: 'Cantidad exacta para aroma'
      }
    ],
    instructions: [
      'Preparar ambiente con música relajante',
      'Calentar aceite de masaje',
      'Agregar aceite esencial',
      'Aplicar aceite con movimientos circulares',
      'Masajear durante 60-80 minutos',
      'Finalizar con toalla tibia'
    ],
    totalCost: 2.10,
    suggestedPrice: 80.00,
    profitMargin: 97.38,
    isActive: true,
    createdBy: 'gerente',
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
    version: 1
  }
];

const mockCategories: RecipeCategory[] = [
  { id: '1', name: 'Tratamientos Faciales' },
  { id: '2', name: 'Masajes' },
  { id: '3', name: 'Cuidado Capilar' },
  { id: '4', name: 'Manicure y Pedicure' },
  { id: '5', name: 'Depilación' },
  { id: '6', name: 'Tratamientos Corporales' }
];

const mockServiceTypes: ServiceType[] = [
  { id: '1', name: 'Limpieza e Hidratación', category: 'Tratamientos Faciales' },
  { id: '2', name: 'Anti-edad', category: 'Tratamientos Faciales' },
  { id: '3', name: 'Masaje Corporal', category: 'Masajes' },
  { id: '4', name: 'Masaje Facial', category: 'Masajes' },
  { id: '5', name: 'Lavado y Peinado', category: 'Cuidado Capilar' },
  { id: '6', name: 'Coloración', category: 'Cuidado Capilar' },
  { id: '7', name: 'Manicure Clásica', category: 'Manicure y Pedicure' },
  { id: '8', name: 'Pedicure Spa', category: 'Manicure y Pedicure' }
];

// Mock products for ingredient selection
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Crema Hidratante Facial',
    code: 'CHF001',
    category: 'Cuidado Facial',
    unit: 'ml',
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
    name: 'Tónico Facial',
    code: 'TF002',
    category: 'Cuidado Facial',
    unit: 'ml',
    price: 22.50,
    supplier: 'Beauty Pro',
    stock: 30,
    minStock: 5,
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Aceite de Masaje Relajante',
    code: 'AMR003',
    category: 'Masajes',
    unit: 'ml',
    price: 35.50,
    supplier: 'Aromas Naturales',
    stock: 8,
    minStock: 2,
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

export { mockRecipes, mockCategories, mockServiceTypes, mockProducts };