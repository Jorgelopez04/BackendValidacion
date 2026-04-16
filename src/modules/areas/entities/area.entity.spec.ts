import { Area } from './area.entity';

describe('Area Entity (AAA)', () => {

  it('debe crear una instancia correctamente', () => {
    // Arrange
    const data = {
      id_area: 1,
      name: 'Producción',
    };

    // Act
    const area = new Area();
    Object.assign(area, data);

    // Assert
    expect(area).toBeDefined();
    expect(area.id_area).toBe(1);
    expect(area.name).toBe('Producción');
  });

  it('debe inicializar roles como array vacío', () => {
    // Arrange
    const area = new Area();

    // Act
    const roles = area.roles;

    // Assert
    expect(roles).toEqual([]);
  });

  it('debe inicializar tasks como array vacío', () => {
    // Arrange
    const area = new Area();

    // Act
    const tasks = area.tasks;

    // Assert
    expect(tasks).toEqual([]);
  });

  it('debe permitir asignación dinámica de propiedades', () => {
    // Arrange
    const area = new Area();

    // Act
    Object.assign(area, {
      id_area: 10,
      name: 'Calidad',
    });

    // Assert
    expect(area).toMatchObject({
      id_area: 10,
      name: 'Calidad',
    });
  });

});