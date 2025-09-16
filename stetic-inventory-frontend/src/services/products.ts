import type { Product, CreateProductData, ProductFilters, ProductCategory, Supplier } from '@/types/product';
// Mock data for development
import { mockProducts, mockCategories, mockSuppliers } from '@/mocks/products';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  // Get all products with filters
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    await delay(500);
    
    let filteredProducts = [...mockProducts];
    
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.code.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.category) {
        filteredProducts = filteredProducts.filter(product =>
          product.category === filters.category
        );
      }
      
      if (filters.supplier) {
        filteredProducts = filteredProducts.filter(product =>
          product.supplier === filters.supplier
        );
      }
      
      if (filters.isActive !== undefined) {
        filteredProducts = filteredProducts.filter(product =>
          product.isActive === filters.isActive
        );
      }
    }
    
    return filteredProducts;
  },

  // Get single product by ID
  async getProduct(id: string): Promise<Product | null> {
    await delay(300);
    return mockProducts.find(product => product.id === id) || null;
  },

  // Create new product
  async createProduct(data: CreateProductData): Promise<Product> {
    await delay(800);
    
    const newProduct: Product = {
      id: Date.now().toString(),
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockProducts.push(newProduct);
    return newProduct;
  },

  // Update existing product
  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    await delay(800);
    
    const index = mockProducts.findIndex(product => product.id === id);
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }
    
    const updatedProduct: Product = {
      ...mockProducts[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    mockProducts[index] = updatedProduct;
    return updatedProduct;
  },

  // Delete product (soft delete)
  async deleteProduct(id: string): Promise<void> {
    await delay(500);
    
    const index = mockProducts.findIndex(product => product.id === id);
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }
    
    mockProducts[index] = {
      ...mockProducts[index],
      isActive: false,
      updatedAt: new Date().toISOString()
    };
  },

  // Get categories
  async getCategories(): Promise<ProductCategory[]> {
    await delay(300);
    return [...mockCategories];
  },

  // Get suppliers
  async getSuppliers(): Promise<Supplier[]> {
    await delay(300);
    return [...mockSuppliers];
  }
};
