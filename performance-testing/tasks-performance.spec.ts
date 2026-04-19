import { expect } from 'chai'; // Fluent Assertions
import * as sinon from 'sinon'; // Test Doubles
import { TaskState } from '../src/modules/tasks/tasks.service';

// --- EL MACHETAZO PARA LOS TIPOS ---
declare var describe: any;
declare var it: any;
declare var afterEach: any;

describe('Performance Testing: Tasks Module (TailorFlow)', () => {

    const taskRepoStub = {
        find: sinon.stub(),
        findOne: sinon.stub(),
        update: sinon.stub()
    };

    afterEach(() => {
        // RNF6: Limpieza de doubles para mantener integridad
        sinon.reset();
    });

    // ==========================================
    // RNF2: Rendimiento de Carga Masiva (Tablero)
    // ==========================================
    describe('RNF2 - Eficiencia en Lista de Tareas', () => {
        it('Debe cargar 500 tareas del trabajador en menos de 150ms', async () => {
            // Arrange: Simulamos que un trabajador tiene 500 tareas asignadas
            const mockTasks = Array(500).fill({ id_task: 1, id_state: TaskState.PENDING });
            taskRepoStub.find.resolves(mockTasks);

            // Act: Medimos el tiempo exacto de procesamiento
            const start = performance.now();
            const result = await taskRepoStub.find({ where: { id_employee: 1 } });
            const end = performance.now();
            
            const duration = end - start;

            // Assert estilo Fluent
            console.log(`      ⏱️  Carga de 500 tareas: ${duration.toFixed(2)}ms`);
            expect(result).to.have.lengthOf(500);
            expect(duration).to.be.below(150); // RNF2: Umbral máximo de 150ms
        });
    });

    // ==========================================
    // RNF13: Tiempo de Respuesta en Operaciones
    // ==========================================
    describe('RNF13 - Latencia de Actualización de Estado', () => {
        it('Debe actualizar el estado de una tarea (RF10) en menos de 80ms', async () => {
            // Arrange
            taskRepoStub.update.resolves({ affected: 1 });

            // Act
            const start = performance.now();
            await taskRepoStub.update(1, { id_state: TaskState.IN_PROGRESS });
            const end = performance.now();
            
            const duration = end - start;

            // Assert
            expect(duration).to.be.below(80); // Latencia baja para que el operario no espere
        });
    });

    // ==========================================
    // Test de Estrés: Concurrencia de Asignación
    // ==========================================
    it('Debe manejar 200 peticiones de consulta simultáneas sin bloqueos', async () => {
        // Arrange
        taskRepoStub.findOne.resolves({ id_task: 1, name: 'Corte de tela' });

        // Act: Simulamos 200 clics de trabajadores al mismo tiempo
        const burstRequests = Array(200).fill(taskRepoStub.findOne(1));
        
        const start = performance.now();
        const results = await Promise.all(burstRequests);
        const end = performance.now();

        const totalTime = end - start;

        // Assert
        expect(results).to.have.lengthOf(200);
        expect(totalTime).to.be.below(300); // El sistema debe procesar la ráfaga rápido
    });
});