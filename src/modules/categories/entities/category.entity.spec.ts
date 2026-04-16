import { Category } from './category.entity';

describe('Category Entity (AAA)', () => {
  
  it('debe crear una instancia correctamente', () => {
    // Arrange
    const data = {
      id_category: 1,
      name: 'Ropa',
      description: 'Categoría de ropa',
    };

    // Act
    const category = new Category();
    Object.assign(category, data);

    // Assert
    expect(category).toBeDefined();
    expect(category.id_category).toBe(1);
    expect(category.name).toBe('Ropa');
    expect(category.description).toBe('Categoría de ropa');
  });

  it('debe permitir description opcional', () => {
    // Arrange
    const data = {
      id_category: 2,
      name: 'Electrónica',
    };

    // Act
    const category = new Category();
    Object.assign(category, data);

    // Assert
    expect(category.description).toBeUndefined();
    expect(category.name).toBe('Electrónica');
  });

  it('debe inicializar relaciones como arrays vacíos', () => {
    // Arrange
    const category = new Category();

    // Act
    const flows = category.flows;
    const products = category.products;

    // Assert
    expect(flows).toEqual([]);
    expect(products).toEqual([]);
  });

});