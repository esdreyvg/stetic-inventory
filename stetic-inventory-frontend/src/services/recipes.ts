import type { Recipe, CreateRecipeData, RecipeFilters, RecipeCategory, ServiceType, RecipeCostCalculation, RecipeIngredient } from '@/types/recipe';
import type { Product } from '@/types/product';
// Mock data for development
import { mockRecipes, mockCategories, mockServiceTypes, mockProducts } from '@/mocks/recipes';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const recipeService = {
  // Get all recipes with filters
  async getRecipes(filters?: RecipeFilters): Promise<Recipe[]> {
    await delay(500);
    
    let filteredRecipes = [...mockRecipes];
    
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.name.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(ing => 
            ing.productName.toLowerCase().includes(searchLower)
          )
        );
      }
      
      if (filters.category) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.category === filters.category
        );
      }
      
      if (filters.serviceType) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.serviceType === filters.serviceType
        );
      }
      
      if (filters.difficulty) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.difficulty === filters.difficulty
        );
      }
      
      if (filters.isActive !== undefined) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.isActive === filters.isActive
        );
      }
    }
    
    return filteredRecipes;
  },

  // Get single recipe by ID
  async getRecipe(id: string): Promise<Recipe | null> {
    await delay(300);
    return mockRecipes.find(recipe => recipe.id === id) || null;
  },

  // Create new recipe
  async createRecipe(data: CreateRecipeData): Promise<Recipe> {
    await delay(800);
    
    // Calculate costs for ingredients
    const ingredientsWithCosts = data.ingredients.map((ingredient, index) => ({
      ...ingredient,
      id: `${Date.now()}_${index}`,
      totalCost: ingredient.requiredQuantity * ingredient.unitCost
    }));
    
    const totalCost = ingredientsWithCosts.reduce(
      (sum, ingredient) => sum + ingredient.totalCost, 
      0
    );
    
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      ...data,
      ingredients: ingredientsWithCosts,
      totalCost,
      isActive: true,
      createdBy: 'current_user', // In real app, get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    
    mockRecipes.push(newRecipe);
    return newRecipe;
  },

  // Update existing recipe
  async updateRecipe(id: string, data: Partial<CreateRecipeData>): Promise<Recipe> {
    await delay(800);
    
    const index = mockRecipes.findIndex(recipe => recipe.id === id);
    if (index === -1) {
      throw new Error('Receta no encontrada');
    }
    
    let updatedIngredients = mockRecipes[index].ingredients;
    let totalCost = mockRecipes[index].totalCost;
    
    if (data.ingredients) {
      updatedIngredients = data.ingredients.map((ingredient, idx) => ({
        ...ingredient,
        id: `${Date.now()}_${idx}`,
        totalCost: ingredient.requiredQuantity * ingredient.unitCost
      }));
      
      totalCost = updatedIngredients.reduce(
        (sum, ingredient) => sum + ingredient.totalCost, 
        0
      );
    }
    
    const updatedRecipe: Recipe = {
      ...mockRecipes[index],
      ...data,
      ingredients: updatedIngredients,
      totalCost,
      updatedAt: new Date().toISOString(),
      version: mockRecipes[index].version + 1
    };
    
    mockRecipes[index] = updatedRecipe;
    return updatedRecipe;
  },

  // Delete recipe (soft delete)
  async deleteRecipe(id: string): Promise<void> {
    await delay(500);
    
    const index = mockRecipes.findIndex(recipe => recipe.id === id);
    if (index === -1) {
      throw new Error('Receta no encontrada');
    }
    
    mockRecipes[index] = {
      ...mockRecipes[index],
      isActive: false,
      updatedAt: new Date().toISOString()
    };
  },

  // Get recipe categories
  async getCategories(): Promise<RecipeCategory[]> {
    await delay(300);
    return [...mockCategories];
  },

  // Get service types
  async getServiceTypes(): Promise<ServiceType[]> {
    await delay(300);
    return [...mockServiceTypes];
  },

  // Get products for ingredient selection
  async getProducts(): Promise<Product[]> {
    await delay(300);
    return [...mockProducts];
  },

  // Calculate recipe cost
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calculateRecipeCost(ingredients: RecipeIngredient[], _laborCostPerHour: number = 15, overheadPercentage: number = 20): RecipeCostCalculation {
    const totalIngredientCost = ingredients.reduce(
      (sum, ingredient) => sum + ingredient.totalCost, 
      0
    );
    
    // Mock labor cost calculation (would be based on estimated duration)
    const laborCost = 0; // This would be calculated based on service duration
    
    const overheadCost = totalIngredientCost * (overheadPercentage / 100);
    const totalCost = totalIngredientCost + laborCost + overheadCost;
    
    // Suggested price with 100% markup
    const suggestedPrice = totalCost * 2;
    const profitAmount = suggestedPrice - totalCost;
    const profitMargin = totalCost > 0 ? (profitAmount / suggestedPrice) * 100 : 0;
    
    return {
      totalIngredientCost,
      laborCost,
      overheadCost,
      totalCost,
      suggestedPrice,
      profitMargin,
      profitAmount
    };
  },

  // Duplicate recipe
  async duplicateRecipe(id: string, newName: string): Promise<Recipe> {
    await delay(500);
    
    const originalRecipe = mockRecipes.find(recipe => recipe.id === id);
    if (!originalRecipe) {
      throw new Error('Receta no encontrada');
    }
    
    const duplicatedRecipe: Recipe = {
      ...originalRecipe,
      id: Date.now().toString(),
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    
    mockRecipes.push(duplicatedRecipe);
    return duplicatedRecipe;
  }
};
