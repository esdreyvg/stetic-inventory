export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  price: number;
  supplier: string;
  description?: string;
  stock: number;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  code: string;
  category: string;
  unit: string;
  price: number;
  supplier: string;
  description?: string;
  stock: number;
  minStock: number;
}

export interface ProductFilters {
  search: string;
  category: string;
  supplier: string;
  isActive?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
}

export type UnitMeasure = 'unidad' | 'kg' | 'g' | 'litro' | 'ml' | 'metro' | 'cm' | 'caja' | 'paquete';
