import { Order } from './order.entity';

describe('Order Entity (AAA)', () => {

  it('debe cubrir todas las líneas de la entidad incluyendo relaciones', () => {
    // Arrange
    const order = new Order();
    const mockState = { id_state: 1, name: 'Pendiente' } as any;
    const mockCustomer = { id_customer: 10, name: 'Cliente' } as any;
    const mockProduct = { id_product: 1, name: 'Camisa' } as any;

    // Act
    order.id_order = 1;
    order.state = mockState;      // Cubre línea 23
    order.customer = mockCustomer; // Cubre línea 27
    order.products = [mockProduct]; // Cubre línea 31 (relación ManyToMany)

    // Assert
    expect(order.id_order).toBe(1);
    expect(order.state).toBeDefined();
    expect(order.customer).toBeDefined();
    expect(order.products).toContain(mockProduct);
    // Acceso explícito para asegurar que el motor de cobertura pase por aquí
    expect((order.state as any).id_state).toBe(1);
    expect((order.customer as any).id_customer).toBe(10);
  });

  it('debe inicializar productos como array vacío por defecto', () => {
    const order = new Order();
    expect(order.products).toEqual([]);
  });

  it('debe permitir campos opcionales', () => {
    const order = new Order();
    order.estimated_delivery_date = new Date();
    expect(order.estimated_delivery_date).toBeInstanceOf(Date);
  });
});