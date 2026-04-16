import { Task } from './task.entity';

describe('Task Entity (AAA)', () => {

  it('debe crear una instancia completa correctamente', () => {
    // Arrange
    const data = {
      id_task: 1,
      id_product: 10,
      id_employee: 5,
      id_area: 2,
      id_state: 1,
      sequence: 1,
      start_date: new Date(),
      end_date: new Date(),
    };

    // Act
    const task = new Task();
    Object.assign(task, data);

    // Assert
    expect(task).toBeDefined();
    expect(task.id_task).toBe(1);
    expect(task.id_product).toBe(10);
    expect(task.id_employee).toBe(5);
    expect(task.sequence).toBe(1);
    expect(task.start_date).toBeInstanceOf(Date);
  });

  it('debe permitir employee opcional', () => {
    // Arrange
    const task = new Task();

    // Act
    task.id_task = 2;
    task.id_product = 1;
    task.id_area = 1;
    task.id_state = 1;
    task.sequence = 1;

    // Assert
    expect(task.id_employee).toBeUndefined();
    expect(task.employee).toBeUndefined();
  });

  it('debe permitir fechas opcionales', () => {
    // Arrange
    const task = new Task();

    // Act
    task.start_date = undefined;
    task.end_date = undefined;

    // Assert
    expect(task.start_date).toBeUndefined();
    expect(task.end_date).toBeUndefined();
  });

  it('debe permitir asignación dinámica', () => {
    // Arrange
    const task = new Task();

    // Act
    Object.assign(task, {
      id_task: 99,
      sequence: 3,
    });

    // Assert
    expect(task).toMatchObject({
      id_task: 99,
      sequence: 3,
    });
  });

});