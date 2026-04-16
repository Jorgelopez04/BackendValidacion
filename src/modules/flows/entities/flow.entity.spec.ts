import { Flow } from './flow.entity';

describe('Flow Entity (AAA)', () => {

  it('debe crear una instancia completa correctamente', () => {
    // Arrange
    const data = {
      id_flow: 1,
      id_category: 10,
      id_role: 5,
      sequence: 1,
    };

    // Act
    const flow = new Flow();
    Object.assign(flow, data);

    // Assert
    expect(flow).toBeDefined();
    expect(flow.id_flow).toBe(1);
    expect(flow.id_category).toBe(10);
    expect(flow.id_role).toBe(5);
    expect(flow.sequence).toBe(1);
  });

  it('debe permitir asignación dinámica de propiedades', () => {
    // Arrange
    const flow = new Flow();

    // Act
    Object.assign(flow, {
      id_flow: 2,
      sequence: 3,
    });

    // Assert
    expect(flow).toMatchObject({
      id_flow: 2,
      sequence: 3,
    });
  });

  it('debe mantener coherencia de ids', () => {
    // Arrange
    const flow = new Flow();

    // Act
    flow.id_category = 1;
    flow.id_role = 2;

    // Assert
    expect(flow.id_category).toBe(1);
    expect(flow.id_role).toBe(2);
  });

});