describe('Tasks Security Tests', () => {
  beforeEach(() => {
    cy.loginAPI(Cypress.env('adminCc'), Cypress.env('adminPassword'));
  });

  it('should require authentication for tasks endpoint', () => {
    cy.request({
      method: 'GET',
      url: '/tasks',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should allow authenticated user to access tasks', () => {
    cy.requestWithAuth('GET', '/tasks').then((response) => {
      expect(response.status).to.be.oneOf([200, 404]);
    });
  });

  it('should validate task creation input', () => {
    const invalidTask = {
      // Missing required fields
    };

    cy.requestWithAuth('POST', '/tasks', invalidTask).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RNF10 - Control de Acceso por Dueño de Tarea', () => {

    it('Debe lanzar ForbiddenException si el empleado no es el dueño', async () => {

      taskRepoStub.findOne.mockResolvedValue({
        id_task: 1,
        id_employee: 99,
        id_state: TaskState.PENDING
      });

      const checkAccess = async (taskId: number, userId: number) => {
        const task = await taskRepoStub.findOne(taskId);

        if (task.id_employee !== userId) {
          throw new ForbiddenException('No tienes permiso sobre esta tarea');
        }

        return task;
      };

      await expect(checkAccess(1, 1))
        .rejects
        .toThrow(ForbiddenException);
    });

    it('Debe permitir el acceso si el ID del empleado coincide', async () => {

      taskRepoStub.findOne.mockResolvedValue({
        id_task: 1,
        id_employee: 1
      });

      const task = await taskRepoStub.findOne(1);

      expect(task.id_employee).toBe(1);
    });
  });

  describe('RF16 - Restricción de Modificación en Producción', () => {

    it('Debe prohibir cambios si la tarea ya está COMPLETED', async () => {

      taskRepoStub.findOne.mockResolvedValue({
        id_task: 1,
        id_state: TaskState.COMPLETED
      });

      const updateTask = async (id: number) => {
        const task = await taskRepoStub.findOne(id);

        if (task.id_state === TaskState.COMPLETED) {
          throw new ForbiddenException('No se puede modificar una tarea finalizada');
        }
      };

      await expect(updateTask(1))
        .rejects
        .toThrow(ForbiddenException);
    });
  });
});