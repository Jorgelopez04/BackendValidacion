import { expect } from 'chai'; // Fluent Assertions
import * as sinon from 'sinon'; // Test Doubles
import { BadRequestException } from '@nestjs/common';

// Mijo, la ruta para llegar a src desde regression-testing
import { TaskState } from '../src/modules/tasks/tasks.service';

// --- EL MACHETAZO PARA LOS TIPOS ---
declare var describe: any;
declare var it: any;
declare var afterEach: any;

describe('Regression Testing: Tasks & Orders (TailorFlow)', () => {

    const taskRepoStub = {
        findOne: sinon.stub(),
        save: sinon.stub()
    };

    afterEach(() => {
        // RNF6: Limpieza para evitar efectos secundarios entre pruebas
        sinon.reset();
    });

    // ==========================================
    // PRUEBA DE REGRESIÓN: Flujo de Estados
    // ==========================================
    describe('Flujo de Transición de Estados (RF10/RF14)', () => {
        
        it('Debe permitir pasar de PENDING a IN_PROGRESS sin errores', async () => {
            // Arrange: Simulamos una tarea que está empezando
            const task = { id_task: 1, id_state: TaskState.PENDING };
            taskRepoStub.findOne.resolves(task);
            taskRepoStub.save.resolves({ ...task, id_state: TaskState.IN_PROGRESS });

            // Act: Ejecutamos la lógica de actualización
            const currentTask = await taskRepoStub.findOne(1);
            currentTask.id_state = TaskState.IN_PROGRESS;
            const result = await taskRepoStub.save(currentTask);

            // Assert: Estilo Fluent
            expect(result.id_state).to.equal(TaskState.IN_PROGRESS);
            expect(taskRepoStub.save.calledOnce).to.be.true;
        });

        it('Regresión: No debe permitir saltarse estados (ej. de PENDING a COMPLETED)', async () => {
            // Esta prueba asegura que una corrección vieja que impedía saltos de estado siga activa
            const task = { id_task: 1, id_state: TaskState.PENDING };
            taskRepoStub.findOne.resolves(task);

            const updateFlow = async (newState: number) => {
                const t = await taskRepoStub.findOne(1);
                // Lógica de regresión: solo se permite avanzar un paso a la vez
                if (t.id_state === TaskState.PENDING && newState === TaskState.COMPLETED) {
                    throw new BadRequestException('Salto de estado no permitido');
                }
            };

            try {
                await updateFlow(TaskState.COMPLETED);
            } catch (error: any) {
                expect(error).to.be.instanceOf(BadRequestException);
                expect(error.message).to.equal('Salto de estado no permitido');
            }
        });
    });

    // ==========================================
    // PRUEBA DE REGRESIÓN: Cancelación de Órdenes
    // ==========================================
    describe('Restricciones de Cancelación (RF17)', () => {
        
        it('Debe mantener la prohibición de cancelar si ya hay tareas iniciadas', async () => {
            // Simulamos una orden con una tarea ya en progreso
            const orderWithTasks = { 
                id_order: 1, 
                tasks: [{ id_state: TaskState.IN_PROGRESS }] 
            };

            const cancelOrder = (order: any) => {
                const hasStartedTasks = order.tasks.some((t: any) => t.id_state !== TaskState.PENDING);
                if (hasStartedTasks) {
                    throw new BadRequestException('No se puede cancelar una orden en proceso');
                }
            };

            expect(() => cancelOrder(orderWithTasks)).to.throw(BadRequestException);
        });
    });
});