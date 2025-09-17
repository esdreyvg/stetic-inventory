export interface RecipeIngredient {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  requiredQuantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isVariable: boolean; // True if quantity can be adjusted per service
  minQuantity?: number;
  maxQuantity?: number;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  serviceType: string;
  estimatedDuration: number; // in minutes
  difficulty: 'facil' | 'intermedio' | 'avanzado';
  ingredients: RecipeIngredient[];
  instructions: string[];
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateRecipeData {
  name: string;
  description: string;
  category: string;
  serviceType: string;
  estimatedDuration: number;
  difficulty: 'facil' | 'intermedio' | 'avanzado';
  ingredients: Omit<RecipeIngredient, 'id' | 'totalCost'>[];
  instructions: string[];
  suggestedPrice: number;
  profitMargin: number;
}

export interface RecipeFilters {
  search: string;
  category: string;
  serviceType: string;
  difficulty: string;
  isActive?: boolean;
}

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface ServiceType {
  id: string;
  name: string;
  category: string;
}

export interface RecipeCostCalculation {
  totalIngredientCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  suggestedPrice: number;
  profitMargin: number;
  profitAmount: number;
}
