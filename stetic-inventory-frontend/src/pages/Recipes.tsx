import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe, RecipeFilters, RecipeCategory, ServiceType } from '@/types/recipe';
import { recipeService } from '@/services/recipes';
import RecipeForm from '@/components/RecipeForm';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Recipes.css';

const Recipes: React.FC = () => {
  const { hasRole } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const [filters, setFilters] = useState<RecipeFilters>({
    search: '',
    category: '',
    serviceType: '',
    difficulty: '',
    isActive: true
  });

  const canManageRecipes = useMemo(() => hasRole(['administrador', 'gerente']), [hasRole]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recipesData, categoriesData, serviceTypesData] = await Promise.all([
        recipeService.getRecipes(),
        recipeService.getCategories(),
        recipeService.getServiceTypes()
      ]);
      
      setRecipes(recipesData);
      setCategories(categoriesData);
      setServiceTypes(serviceTypesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...recipes];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some(ing => 
          ing.productName.toLowerCase().includes(searchLower)
        )
      );
    }

    if (filters.category) {
      filtered = filtered.filter(recipe => recipe.category === filters.category);
    }

    if (filters.serviceType) {
      filtered = filtered.filter(recipe => recipe.serviceType === filters.serviceType);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(recipe => recipe.isActive === filters.isActive);
    }

    setFilteredRecipes(filtered);
  }, [recipes, filters]);

  const handleCreateRecipe = useCallback(() => {
    setEditingRecipe(undefined);
    setShowForm(true);
  }, []);

  const handleEditRecipe = useCallback((recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  }, []);

  const handleSaveRecipe = useCallback((savedRecipe: Recipe) => {
    if (editingRecipe) {
      setRecipes(prev => prev.map(r => 
        r.id === savedRecipe.id ? savedRecipe : r
      ));
    } else {
      setRecipes(prev => [...prev, savedRecipe]);
    }
  }, [editingRecipe]);

  const handleDeleteRecipe = useCallback(async (recipe: Recipe) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${recipe.name}"?`)) {
      try {
        await recipeService.deleteRecipe(recipe.id);
        setRecipes(prev => prev.map(r => 
          r.id === recipe.id ? { ...r, isActive: false } : r
        ));
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  }, []);

  const handleDuplicateRecipe = useCallback(async (recipe: Recipe) => {
    const newName = prompt('Nombre para la copia:', `${recipe.name} (Copia)`);
    if (newName && newName.trim()) {
      try {
        const duplicatedRecipe = await recipeService.duplicateRecipe(recipe.id, newName.trim());
        setRecipes(prev => [...prev, duplicatedRecipe]);
      } catch (error) {
        console.error('Error duplicating recipe:', error);
      }
    }
  }, []);

  const handleFilterChange = useCallback((key: keyof RecipeFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      serviceType: '',
      difficulty: '',
      isActive: true
    });
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return '#27ae60';
      case 'intermedio': return '#f39c12';
      case 'avanzado': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Fácil';
      case 'intermedio': return 'Intermedio';
      case 'avanzado': return 'Avanzado';
      default: return difficulty;
    }
  };

  const filteredServiceTypes = useMemo(() => 
    serviceTypes.filter(st => !filters.category || st.category === filters.category),
    [serviceTypes, filters.category]
  );

  useEffect(() => {
    loadInitialData();
  }, []); // Empty dependency array

  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Now applyFilters is memoized

  if (isLoading) {
    return (
      <div className="recipes-container">
        <div className="loading-state">Cargando recetas...</div>
      </div>
    );
  }

  return (
    <div className="recipes-container">
      <div className="recipes-content">
        <div className="recipes-header">
          <h2>Gestión de Recetas</h2>
          {canManageRecipes && (
            <button className="btn-primary" onClick={handleCreateRecipe}>
              Crear Receta
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="recipes-filters">
          <div className="filter-row">
            <div className="search-group">
              <input
                type="text"
                placeholder="Buscar recetas o ingredientes..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los servicios</option>
                {filteredServiceTypes.map(serviceType => (
                  <option key={serviceType.id} value={serviceType.name}>
                    {serviceType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las dificultades</option>
                <option value="facil">Fácil</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.isActive ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
                className="filter-select"
              >
                <option value="true">Recetas activas</option>
                <option value="false">Recetas inactivas</option>
              </select>
            </div>

            <button className="btn-secondary" onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="recipes-stats">
          <div className="stat-card">
            <span className="stat-number">{filteredRecipes.length}</span>
            <span className="stat-label">Recetas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredRecipes.filter(r => r.difficulty === 'facil').length}
            </span>
            <span className="stat-label">Fáciles</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredRecipes.filter(r => r.difficulty === 'intermedio').length}
            </span>
            <span className="stat-label">Intermedias</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {filteredRecipes.filter(r => r.difficulty === 'avanzado').length}
            </span>
            <span className="stat-label">Avanzadas</span>
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-header">
                <h3>{recipe.name}</h3>
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                >
                  {getDifficultyText(recipe.difficulty)}
                </span>
              </div>

              <div className="recipe-info">
                <p className="recipe-description">{recipe.description}</p>
                
                <div className="recipe-meta">
                  <div className="meta-item">
                    <span className="meta-label">Categoría:</span>
                    <span>{recipe.category}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Servicio:</span>
                    <span>{recipe.serviceType}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Duración:</span>
                    <span>{recipe.estimatedDuration} min</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Ingredientes:</span>
                    <span>{recipe.ingredients.length}</span>
                  </div>
                </div>

                <div className="recipe-cost">
                  <div className="cost-item">
                    <span>Costo: ${recipe.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Precio: ${recipe.suggestedPrice.toFixed(2)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Margen: {recipe.profitMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="recipe-ingredients">
                <strong>Ingredientes principales:</strong>
                <ul>
                  {recipe.ingredients.slice(0, 3).map(ingredient => (
                    <li key={ingredient.id}>
                      {ingredient.productName} - {ingredient.requiredQuantity}{ingredient.unit}
                      {ingredient.isVariable && ' (variable)'}
                    </li>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <li>... y {recipe.ingredients.length - 3} más</li>
                  )}
                </ul>
              </div>

              <div className="recipe-actions">
                <button 
                  className="btn-view"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  Ver Detalles
                </button>
                {canManageRecipes && (
                  <>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditRecipe(recipe)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-duplicate"
                      onClick={() => handleDuplicateRecipe(recipe)}
                    >
                      Duplicar
                    </button>
                    {recipe.isActive && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteRecipe(recipe)}
                      >
                        Eliminar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="no-recipes">
            <p>No se encontraron recetas que coincidan con los filtros.</p>
          </div>
        )}

        <RecipeForm
          recipe={editingRecipe}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSaveRecipe}
        />

        {/* Recipe Details Modal */}
        {selectedRecipe && (
          <div className="recipe-details-overlay">
            <div className="recipe-details-modal">
              <div className="modal-header">
                <h3>{selectedRecipe.name}</h3>
                <button 
                  className="btn-close" 
                  onClick={() => setSelectedRecipe(null)}
                >
                  ×
                </button>
              </div>

              <div className="recipe-details-content">
                <div className="details-section">
                  <h4>Información General</h4>
                  <p><strong>Descripción:</strong> {selectedRecipe.description}</p>
                  <p><strong>Categoría:</strong> {selectedRecipe.category}</p>
                  <p><strong>Tipo de Servicio:</strong> {selectedRecipe.serviceType}</p>
                  <p><strong>Duración:</strong> {selectedRecipe.estimatedDuration} minutos</p>
                  <p><strong>Dificultad:</strong> {getDifficultyText(selectedRecipe.difficulty)}</p>
                </div>

                <div className="details-section">
                  <h4>Ingredientes</h4>
                  <div className="ingredients-details">
                    {selectedRecipe.ingredients.map(ingredient => (
                      <div key={ingredient.id} className="ingredient-detail">
                        <div className="ingredient-main">
                          <strong>{ingredient.productName}</strong>
                          <span>({ingredient.productCode})</span>
                        </div>
                        <div className="ingredient-quantity">
                          {ingredient.requiredQuantity} {ingredient.unit}
                          {ingredient.isVariable && (
                            <span className="variable-indicator">
                              {ingredient.minQuantity && ingredient.maxQuantity 
                                ? ` (${ingredient.minQuantity}-${ingredient.maxQuantity} ${ingredient.unit})`
                                : ' (variable)'
                              }
                            </span>
                          )}
                        </div>
                        <div className="ingredient-cost">
                          ${ingredient.totalCost.toFixed(2)}
                        </div>
                        {ingredient.notes && (
                          <div className="ingredient-notes">{ingredient.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Instrucciones</h4>
                  <ol className="instructions-list">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div className="details-section">
                  <h4>Costos</h4>
                  <div className="cost-breakdown">
                    <div className="cost-row">
                      <span>Costo total de ingredientes:</span>
                      <span>${selectedRecipe.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="cost-row">
                      <span>Precio sugerido:</span>
                      <span>${selectedRecipe.suggestedPrice.toFixed(2)}</span>
                    </div>
                    <div className="cost-row">
                      <span>Margen de ganancia:</span>
                      <span>{selectedRecipe.profitMargin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
