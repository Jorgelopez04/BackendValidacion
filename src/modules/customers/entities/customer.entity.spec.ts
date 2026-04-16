import { Customer } from './customer.entity';

describe('Customer Entity (AAA)', () => {

  it('debe crear una instancia completa correctamente', () => {
    // Arrange
    const data = {
      id_customer: 1,
      name: 'Juan',
      address: 'Calle 123',
      phone: '3001234567',
    };

    // Act
    const customer = new Customer();
    Object.assign(customer, data);

    // Assert
    expect(customer).toBeDefined();
    expect(customer.id_customer).toBe(1);
    expect(customer.name).toBe('Juan');
    expect(customer.address).toBe('Calle 123');
    expect(customer.phone).toBe('3001234567');
  });

  it('debe permitir address opcional', () => {
    // Arrange
    const data = {
      id_customer: 2,
      name: 'Maria',
      phone: '3000000000',
    };

    // Act
    const customer = new Customer();
    Object.assign(customer, data);

    // Assert
    expect(customer.address).toBeUndefined();
    expect(customer.name).toBe('Maria');
  });

  it('debe inicializar orders como array vacío', () => {
    // Arrange
    const customer = new Customer();

    // Act
    const orders = customer.orders;

    // Assert
    expect(orders).toEqual([]);
  });

  it('debe permitir asignación dinámica', () => {
    // Arrange
    const customer = new Customer();

    // Act
    Object.assign(customer, {
      id_customer: 10,
      name: 'Test',
      phone: '123',
    });

    // Assert
    expect(customer).toMatchObject({
      id_customer: 10,
      name: 'Test',
      phone: '123',
    });
  });

});