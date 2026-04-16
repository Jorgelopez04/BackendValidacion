import { Role } from './role.entity';

describe('Role Entity (AAA)', () => {

  it('debe crear una instancia completa correctamente', () => {
    // Arrange
    const data = {
      id_role: 1,
      id_area: 10,
      name: 'Administrador',
      description: 'Rol principal',
    };

    // Act
    const role = new Role();
    Object.assign(role, data);

    // Assert
    expect(role).toBeDefined();
    expect(role.id_role).toBe(1);
    expect(role.name).toBe('Administrador');
    expect(role.description).toBe('Rol principal');
  });

  it('debe permitir campos opcionales', () => {
    // Arrange
    const role = new Role();

    // Act
    role.name = 'Operador';

    // Assert
    expect(role.id_area).toBeUndefined();
    expect(role.description).toBeUndefined();
    expect(role.area).toBeUndefined();
  });

  it('debe inicializar relaciones como arrays vacíos', () => {
    // Arrange
    const role = new Role();

    // Act
    const employees = role.employees;
    const flows = role.flows;

    // Assert
    expect(employees).toEqual([]);
    expect(flows).toEqual([]);
  });

  it('debe permitir asignación dinámica', () => {
    // Arrange
    const role = new Role();

    // Act
    Object.assign(role, {
      id_role: 99,
      name: 'Test',
    });

    // Assert
    expect(role).toMatchObject({
      id_role: 99,
      name: 'Test',
    });
  });

});