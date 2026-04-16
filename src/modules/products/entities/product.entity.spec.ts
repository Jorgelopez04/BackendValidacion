import { Product } from './product.entity';

describe('Product Entity (AAA)', () => {

  it('debe crear una instancia completa correctamente', () => {
    // Arrange
    const data = {
      id_product: 1,
      id_order: 10,
      id_category: 5,
      id_state: 1,
      name: 'Camisa',
      ref_photo: 'img.jpg',
      dimensions: 'M',
      fabric: 'Algodón',
      description: 'Camisa elegante',
    };

    // Act
    const product = new Product();
    Object.assign(product, data);

    // Assert
    expect(product).toBeDefined();
    expect(product.id_product).toBe(1);
    expect(product.name).toBe('Camisa');
    expect(product.ref_photo).toBe('img.jpg');
    expect(product.fabric).toBe('Algodón');
  });

  it('debe permitir campos opcionales vacíos', () => {
    // Arrange
    const product = new Product();

    // Act
    product.id_product = 2;
    product.name = 'Pantalón';
    product.id_order = 1;
    product.id_category = 1;
    product.id_state = 1;

    // Assert
    expect(product.ref_photo).toBeUndefined();
    expect(product.description).toBeUndefined();
  });

  it('debe inicializar tasks como array vacío', () => {
    // Arrange
    const product = new Product();

    // Act
    const tasks = product.tasks;

    // Assert
    expect(tasks).toEqual([]);
  });

  it('debe permitir asignación dinámica', () => {
    // Arrange
    const product = new Product();

    // Act
    Object.assign(product, {
      id_product: 99,
      name: 'Test',
    });

    // Assert
    expect(product).toMatchObject({
      id_product: 99,
      name: 'Test',
    });
  });

});