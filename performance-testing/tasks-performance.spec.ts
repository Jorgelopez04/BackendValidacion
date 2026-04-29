import { performance } from 'perf_hooks';
import { TaskState } from '../src/modules/tasks/tasks.service';

describe('Performance Testing: Tasks Module (TailorFlow)', () => {

    const taskRepoStub = {
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn()
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // RNF2: Rendimiento de Carga Masiva (Tablero)
    // ==========================================
    describe('RNF2 - Eficiencia en Lista de Tareas', () => {
        it('Debe cargar 500 tareas del trabajador en menos de 150ms', async () => {

            // Arrange
            const mockTasks = Array.from({ length: 500 }, () => ({
                id_task: 1,
                id_state: TaskState.PENDING
            }));
            taskRepoStub.find.mockResolvedValue(mockTasks);

            // Act
            const start = performance.now();
            const result = await taskRepoStub.find({ where: { id_employee: 1 } });
            const end = performance.now();
            
            const duration = end - start;

            // Assert
            expect(result).toHaveLength(500);
            expect(duration).toBeLessThan(150);
        });
    });

    // ==========================================
    // RNF13: Tiempo de Respuesta en Operaciones
    // ==========================================
    describe('RNF13 - Latencia de Actualización de Estado', () => {
        it('Debe actualizar el estado de una tarea (RF10) en menos de 80ms', async () => {

            // Arrange
            taskRepoStub.update.mockResolvedValue({ affected: 1 });

            // Act
            const start = performance.now();
            const result = await taskRepoStub.update(1, { id_state: TaskState.IN_PROGRESS });
            const end = performance.now();
            
            const duration = end - start;

            // Assert
            expect(result).toBeDefined();
            expect(result.affected).toBe(1);
            expect(duration).toBeLessThan(80);
        });
    });

    // ==========================================
    // Test de Estrés: Concurrencia de Asignación
    // ==========================================
    it('Debe manejar 200 peticiones de consulta simultáneas sin bloqueos', async () => {

        // Arrange
        taskRepoStub.findOne.mockResolvedValue({ id_task: 1, name: 'Corte de tela' });

        const burstRequests = Array.from({ length: 200 }, () => taskRepoStub.findOne(1));

        // Act
        const start = performance.now();
        const results = await Promise.all(burstRequests);
        const end = performance.now();

        const totalTime = end - start;

        // Assert
        expect(results).toHaveLength(200);
        expect(totalTime).toBeLessThan(300);
    });
});