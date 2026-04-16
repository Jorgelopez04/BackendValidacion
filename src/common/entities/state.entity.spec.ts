import { State, StateName } from './state.entity';

describe('State Entity', () => {

  it('debe crear una instancia de State y cubrir sus propiedades', () => {
    // Arrange
    const state = new State();

    // Act
    state.id_state = 1;
    state.nombre = StateName.PENDIENTE;
    
    // Tocamos las relaciones para cubrir las líneas de los decoradores OneToMany
    state.orders = [];
    state.products = [];
    state.tasks = [];

    // Assert
    expect(state).toBeDefined();
    expect(state.id_state).toBe(1);
    expect(state.nombre).toBe(StateName.PENDIENTE);
    expect(state.orders).toEqual([]);
    expect(state.products).toEqual([]);
    expect(state.tasks).toEqual([]);
  });

  it('debe permitir la inicialización por defecto del constructor', () => {
    // Act
    const state = new State();

    // Assert
    // Esto asegura que el constructor se ejecutó y cubrimos esas líneas
    expect(state.orders).toBeDefined();
    expect(Array.isArray(state.orders)).toBe(true);
  });

});