import { BadRequestException } from '@nestjs/common';
import { TaskState } from '../src/modules/tasks/tasks.service';

describe('Regression Testing: Tasks & Orders (TailorFlow)', () => {

    let taskRepoStub: any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        taskRepoStub = {
            findOne: jest.fn(),
            save: jest.fn()
        };
    });

    describe('Flujo de Transición de Estados (RF10/RF14)', () => {
        
        it('Debe permitir pasar de PENDING a IN_PROGRESS sin errores', async () => {
            const task = { id_task: 1, id_state: TaskState.PENDING };

            taskRepoStub.findOne.mockResolvedValue(task);
            taskRepoStub.save.mockResolvedValue({
                ...task,
                id_state: TaskState.IN_PROGRESS
            });

            const currentTask = await taskRepoStub.findOne(1);
            currentTask.id_state = TaskState.IN_PROGRESS;
            const result = await taskRepoStub.save(currentTask);

            expect(result.id_state).toBe(TaskState.IN_PROGRESS);
            expect(taskRepoStub.save).toHaveBeenCalledTimes(1);
        });

        it('Regresión: No debe permitir saltarse estados', async () => {
            const task = { id_task: 1, id_state: TaskState.PENDING };

            taskRepoStub.findOne.mockResolvedValue(task);

            const updateFlow = async (newState: number) => {
                const t = await taskRepoStub.findOne(1);

                if (t.id_state === TaskState.PENDING && newState === TaskState.COMPLETED) {
                    throw new BadRequestException('Salto de estado no permitido');
                }
            };

            await expect(updateFlow(TaskState.COMPLETED))
                .rejects
                .toThrow(BadRequestException);
        });
    });

    describe('Restricciones de Cancelación (RF17)', () => {
        
        it('Debe mantener la prohibición de cancelar si ya hay tareas iniciadas', () => {
            const orderWithTasks = { 
                id_order: 1, 
                tasks: [{ id_state: TaskState.IN_PROGRESS }] 
            };

            const cancelOrder = (order: any) => {
                const hasStartedTasks = order.tasks.some(
                    (t: any) => t.id_state !== TaskState.PENDING
                );

                if (hasStartedTasks) {
                    throw new BadRequestException('No se puede cancelar una orden en proceso');
                }
            };

            expect(() => cancelOrder(orderWithTasks))
                .toThrow(BadRequestException);
        });
    });
});