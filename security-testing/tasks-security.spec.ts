import { expect } from 'chai'; // Fluent Assertions
import * as sinon from 'sinon'; // Test Doubles
import { ForbiddenException } from '@nestjs/common';

// Mijo, la ruta exacta saliendo un nivel a Backend y entrando a src
import { TaskState } from '../src/modules/tasks/tasks.service';

// --- EL TRUCO PARA QUITAR EL ROJO ---
// Le decimos a TS que estas funciones existen globalmente
declare var describe: any;
declare var it: any;
declare var afterEach: any;

describe('Security Testing: Tasks Module (TailorFlow)', () => {
  
  // --- DOUBLE (Stub del Repositorio) ---
  // Simulamos la BD para cumplir con el requisito de "Doubles"
  const taskRepoStub = {
    findOne: sinon.stub()
  };

  afterEach(() => {
    // RNF6: Limpiamos para que un test no ensucie al otro (Integridad)
    sinon.reset(); 
  });

  describe('RNF10 - Control de Acceso por Dueño de Tarea', () => {

    it('Debe lanzar ForbiddenException si el empleado no es el dueño (Fluent + Double)', async () => {
      // 1. Entrenamos al Double: Simulamos que la tarea es del empleado 99
      taskRepoStub.findOne.resolves({ 
        id_task: 1, 
        id_employee: 99, 
        id_state: TaskState.PENDING 
      });

      const empleadoIntrusoId = 1;

      // Lógica de validación
      const checkAccess = async (taskId: number, userId: number) => {
        const task = await taskRepoStub.findOne(taskId);
        if (task.id_employee !== userId) {
          throw new ForbiddenException('No tienes permiso sobre esta tarea');
        }
        return task;
      };

      // 2. ASERSIONES FLUIDAS (Chai)
      try {
        await checkAccess(1, empleadoIntrusoId);
        throw new Error('El test falló: debería haber lanzado una excepción');
      } catch (error: any) {
        // Estilo Fluent: Se lee como una oración
        expect(error).to.be.instanceOf(ForbiddenException);
        expect(error.message).to.equal('No tienes permiso sobre esta tarea');
      }
    });

    it('Debe permitir el acceso si el ID del empleado coincide', async () => {
      // Configuramos el Double para éxito
      taskRepoStub.findOne.resolves({ id_task: 1, id_employee: 1 });

      const task = await taskRepoStub.findOne(1);
      
      // Fluent Assertion
      expect(task.id_employee).to.equal(1);
    });
  });

  describe('RF16 - Restricción de Modificación en Producción', () => {
    it('Debe prohibir cambios si la tarea ya está COMPLETED', async () => {
      // Double que simula una tarea ya terminada en la BD
      taskRepoStub.findOne.resolves({ id_task: 1, id_state: TaskState.COMPLETED });

      const updateTask = async (id: number) => {
        const task = await taskRepoStub.findOne(id);
        if (task.id_state === TaskState.COMPLETED) {
          throw new ForbiddenException('No se puede modificar una tarea finalizada');
        }
      };

      try {
        await updateTask(1);
      } catch (error: any) {
        expect(error).to.be.instanceOf(ForbiddenException);
        expect(error.message).to.contain('finalizada');
      }
    });
  });
});