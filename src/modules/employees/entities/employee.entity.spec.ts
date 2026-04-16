import { Employee, States } from './employee.entity';

describe('Employee Entity (AAA)', () => {

  it('debe crear una instancia completa correctamente', () => {
    // Arrange
    const data = {
      id_employee: 1,
      id_role: 2,
      cc: '123456',
      name: 'Juan Pérez',
      password: '123456',
      state: States.ACTIVE,
    };

    // Act
    const employee = new Employee();
    Object.assign(employee, data);

    // Assert
    expect(employee).toBeDefined();
    expect(employee.id_employee).toBe(1);
    expect(employee.id_role).toBe(2);
    expect(employee.cc).toBe('123456');
    expect(employee.name).toBe('Juan Pérez');
    expect(employee.password).toBe('123456');
    expect(employee.state).toBe(States.ACTIVE);
  });

  it('debe usar estado por defecto ACTIVE', () => {
    // Arrange
    const employee = new Employee();

    // Act
    employee.state = States.ACTIVE;

    // Assert
    expect(employee.state).toBe(States.ACTIVE);
  });

  it('debe permitir estado INACTIVE', () => {
    // Arrange
    const employee = new Employee();

    // Act
    employee.state = States.INACTIVE;

    // Assert
    expect(employee.state).toBe(States.INACTIVE);
  });

  it('debe inicializar tasks como array vacío', () => {
    // Arrange
    const employee = new Employee();

    // Act
    const tasks = employee.tasks;

    // Assert
    expect(tasks).toEqual([]);
  });

  it('debe asignar propiedades dinámicamente', () => {
    // Arrange
    const employee = new Employee();

    // Act
    Object.assign(employee, {
      id_employee: 10,
      name: 'Test',
      cc: '999',
    });

    // Assert
    expect(employee).toMatchObject({
      id_employee: 10,
      name: 'Test',
      cc: '999',
    });
  });

});