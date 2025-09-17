import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe, CreateRecipeData, RecipeCategory, ServiceType } from '@/types/recipe';
import type { Product } from '@/types/product';
import { recipeService } from '@/services/recipes';
import '@/styles/RecipeForm.css';

interface RecipeFormProps {
  recipe?: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateRecipeData>({
    name: '',
    description: '',
    category: '',
    serviceType: '',
    estimatedDuration: 60,
    difficulty: 'facil',
    ingredients: [],
    instructions: [''],
    suggestedPrice: 0,
    profitMargin: 50
  });

  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [costCalculation, setCostCalculation] = useState({
    totalCost: 0,
    suggestedPrice: 0,
    profitMargin: 0
  });

  const loadFormData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesData, serviceTypesData, productsData] = await Promise.all([
        recipeService.getCategories(),
        recipeService.getServiceTypes(),
        recipeService.getProducts()
      ]);
      
      setCategories(categoriesData);
      setServiceTypes(serviceTypesData);
      setProducts(productsData);

      if (recipe) {
        setFormData({
          name: recipe.name,
          description: recipe.description,
          category: recipe.category,
          serviceType: recipe.serviceType,
          estimatedDuration: recipe.estimatedDuration,
          difficulty: recipe.difficulty,
          ingredients: recipe.ingredients.map(ing => ({
            productId: ing.productId,
            productName: ing.productName,
            productCode: ing.productCode,
            requiredQuantity: ing.requiredQuantity,
            unit: ing.unit,
            unitCost: ing.unitCost,
            isVariable: ing.isVariable,
            minQuantity: ing.minQuantity,
            maxQuantity: ing.maxQuantity,
            notes: ing.notes
          })),
          instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
          suggestedPrice: recipe.suggestedPrice,
          profitMargin: recipe.profitMargin
        });
      } else {
        setFormData({
          name: '',
          description: '',
          category: categoriesData[0]?.name || '',
          serviceType: serviceTypesData[0]?.name || '',
          estimatedDuration: 60,
          difficulty: 'facil',
          ingredients: [],
          instructions: [''],
          suggestedPrice: 0,
          profitMargin: 50
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recipe]);

  const calculateCosts = useCallback(() => {
    const totalCost = formData.ingredients.reduce(
      (sum, ingredient) => sum + (ingredient.requiredQuantity * ingredient.unitCost), 
      0
    );
    
    const suggestedPrice = totalCost * 2; // 100% markup
    const profitMargin = totalCost > 0 ? ((suggestedPrice - totalCost) / suggestedPrice) * 100 : 0;
    
    setCostCalculation({
      totalCost,
      suggestedPrice,
      profitMargin
    });
    
    // Update form data with calculated values
    setFormData(prev => ({
      ...prev,
      suggestedPrice
    }));
  }, [formData.ingredients]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.serviceType) {
      newErrors.serviceType = 'El tipo de servicio es requerido';
    }

    if (formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = 'La duración debe ser mayor a 0';
    }

    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'Debe agregar al menos un ingrediente';
    }

    if (formData.instructions.some(inst => !inst.trim())) {
      newErrors.instructions = 'Todas las instrucciones deben tener contenido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let savedRecipe: Recipe;
      
      if (recipe) {
        savedRecipe = await recipeService.updateRecipe(recipe.id, formData);
      } else {
        savedRecipe = await recipeService.createRecipe(formData);
      }
      
      onSave(savedRecipe);
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
      setErrors({ submit: 'Error al guardar la receta' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, recipe, validateForm, onSave, onClose]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const addIngredient = useCallback(() => {
    const newIngredient = {
      productId: '',
      productName: '',
      productCode: '',
      requiredQuantity: 0,
      unit: 'ml',
      unitCost: 0,
      isVariable: false,
      notes: ''
    };
    
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  }, []);

  const updateIngredient = useCallback((index: number, field: string, value: unknown) => {
    setFormData(prev => {
      const updatedIngredients = [...prev.ingredients];
      
      if (field === 'productId') {
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct) {
          updatedIngredients[index] = {
            ...updatedIngredients[index],
            productId: value as string,
            productName: selectedProduct.name,
            productCode: selectedProduct.code,
            unit: 'ml', // Default unit for recipes
            unitCost: selectedProduct.price / 100 // Estimate cost per ml
          };
        }
      } else {
        updatedIngredients[index] = {
          ...updatedIngredients[index],
          [field]: value
        };
      }
      
      return {
        ...prev,
        ingredients: updatedIngredients
      };
    });
  }, [products]);

  const removeIngredient = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  }, []);

  const addInstruction = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  }, []);

  const updateInstruction = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const updatedInstructions = [...prev.instructions];
      updatedInstructions[index] = value;
      
      return {
        ...prev,
        instructions: updatedInstructions
      };
    });
  }, []);

  const removeInstruction = useCallback((index: number) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  }, [formData.instructions.length]);

  const filteredServiceTypes = useMemo(() => 
    serviceTypes.filter(st => st.category === formData.category),
    [serviceTypes, formData.category]
  );

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen, loadFormData]);

  useEffect(() => {
    calculateCosts();
  }, [calculateCosts]);

  if (!isOpen) return null;

  return (
    <div className="recipe-form-overlay">
      <div className="recipe-form-modal">
        <div className="form-header">
          <h3>{recipe ? 'Editar Receta' : 'Crear Nueva Receta'}</h3>
          <button className="btn-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="recipe-form">
            {/* Basic Information */}
            <div className="form-section">
              <h4>Información Básica</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre de la Receta *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Ej: Tratamiento Hidratante Facial"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedDuration">Duración (minutos) *</label>
                  <input
                    type="number"
                    id="estimatedDuration"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    className={errors.estimatedDuration ? 'error' : ''}
                    min="5"
                    step="5"
                  />
                  {errors.estimatedDuration && <span className="error-message">{errors.estimatedDuration}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={errors.description ? 'error' : ''}
                  rows={3}
                  placeholder="Descripción del servicio..."
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Categoría *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="serviceType">Tipo de Servicio *</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className={errors.serviceType ? 'error' : ''}
                  >
                    <option value="">Seleccionar tipo</option>
                    {filteredServiceTypes.map(serviceType => (
                      <option key={serviceType.id} value={serviceType.name}>
                        {serviceType.name}
                      </option>
                    ))}
                  </select>
                  {errors.serviceType && <span className="error-message">{errors.serviceType}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">Dificultad</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="facil">Fácil</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="form-section">
              <div className="section-header">
                <h4>Ingredientes</h4>
                <button type="button" className="btn-add" onClick={addIngredient}>
                  Agregar Ingrediente
                </button>
              </div>
              
              {errors.ingredients && <div className="error-message">{errors.ingredients}</div>}
              
              <div className="ingredients-list">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-item">
                    <div className="ingredient-row">
                      <div className="form-group">
                        <label>Producto</label>
                        <select
                          value={ingredient.productId}
                          onChange={(e) => updateIngredient(index, 'productId', e.target.value)}
                        >
                          <option value="">Seleccionar producto</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Cantidad</label>
                        <input
                          type="number"
                          value={ingredient.requiredQuantity}
                          onChange={(e) => updateIngredient(index, 'requiredQuantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Unidad</label>
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        >
                          <option value="ml">ml</option>
                          <option value="g">g</option>
                          <option value="gotas">gotas</option>
                          <option value="unidad">unidad</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Costo Unitario</label>
                        <input
                          type="number"
                          value={ingredient.unitCost}
                          onChange={(e) => updateIngredient(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeIngredient(index)}
                      >
                        ×
                      </button>
                    </div>

                    <div className="ingredient-options">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={ingredient.isVariable}
                          onChange={(e) => updateIngredient(index, 'isVariable', e.target.checked)}
                        />
                        Cantidad variable
                      </label>

                      {ingredient.isVariable && (
                        <div className="variable-range">
                          <input
                            type="number"
                            value={ingredient.minQuantity || ''}
                            onChange={(e) => updateIngredient(index, 'minQuantity', parseFloat(e.target.value) || undefined)}
                            placeholder="Mín"
                            min="0"
                          />
                          <span>a</span>
                          <input
                            type="number"
                            value={ingredient.maxQuantity || ''}
                            onChange={(e) => updateIngredient(index, 'maxQuantity', parseFloat(e.target.value) || undefined)}
                            placeholder="Máx"
                            min="0"
                          />
                        </div>
                      )}

                      <input
                        type="text"
                        value={ingredient.notes || ''}
                        onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                        placeholder="Notas adicionales..."
                        className="ingredient-notes"
                      />
                    </div>

                    <div className="ingredient-cost">
                      Costo total: ${(ingredient.requiredQuantity * ingredient.unitCost).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="form-section">
              <div className="section-header">
                <h4>Instrucciones</h4>
                <button type="button" className="btn-add" onClick={addInstruction}>
                  Agregar Paso
                </button>
              </div>
              
              {errors.instructions && <div className="error-message">{errors.instructions}</div>}
              
              <div className="instructions-list">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="instruction-item">
                    <span className="step-number">{index + 1}.</span>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Paso ${index + 1}...`}
                      rows={2}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeInstruction(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Calculation */}
            <div className="form-section">
              <h4>Cálculo de Costos</h4>
              
              <div className="cost-summary">
                <div className="cost-item">
                  <span>Costo de ingredientes:</span>
                  <span>${costCalculation.totalCost.toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span>Precio sugerido:</span>
                  <span>${costCalculation.suggestedPrice.toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span>Margen de ganancia:</span>
                  <span>{costCalculation.profitMargin.toFixed(1)}%</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="suggestedPrice">Precio Final</label>
                <input
                  type="number"
                  id="suggestedPrice"
                  name="suggestedPrice"
                  value={formData.suggestedPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            {errors.submit && <div className="submit-error">{errors.submit}</div>}

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : (recipe ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecipeForm;
