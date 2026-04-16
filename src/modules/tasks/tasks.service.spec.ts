import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TasksService, TaskState } from './tasks.service';
import { Task } from './entities/task.entity';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('TasksService - SONAR GOD INTEGRATED', () => {
  let service: TasksService;

  // Mock Maestro de QueryBuilder para DataSource
  const mockQueryBuilder: any = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockDataSource: any = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockRepo: any = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('🔍 Consultas (Queries)', () => {
    it('findAll: debe lanzar NotFoundException si el repositorio retorna vacío (Líneas 39-47)', async () => {
  mockRepo.find.mockResolvedValue([]); 
  
  try {
    await service.findAll();
    fail('Debería haber lanzado una excepción'); // Esto asegura que el test falle si NO lanza error
  } catch (error: any) {
    expect(error).toBeInstanceOf(NotFoundException);
    expect(error.message).toBeDefined(); // Ahora sí funcionará
  }
});

    it('findAll: debe retornar lista de tareas mapeadas', async () => {
      mockRepo.find.mockResolvedValue([{ id_task: 1 }]);
      const res = await service.findAll();
      expect(res).toBeDefined();
    });

    it('findAssignedTasks: enriquecimiento de estado previo y mapeo', async () => {
      mockRepo.find.mockResolvedValue([{ id_product: 1, sequence: 2 }]);
      mockRepo.findOne.mockResolvedValue({ id_state: TaskState.COMPLETED });
      const res = await service.findAssignedTasks(1);
      expect(res).toBeDefined();
      expect(mockRepo.findOne).toHaveBeenCalled();
    });

    it('findAssignedTasks: retorno rápido si está vacío', async () => {
      mockRepo.find.mockResolvedValue([]);
      const res = await service.findAssignedTasks(1);
      expect(res).toEqual([]);
    });
  });

  describe('🏗️ Creación y Asignación', () => {
    it('createTask: error si la secuencia ya existe', async () => {
      mockRepo.findOne.mockResolvedValue({ id_task: 1 });
      await expect(service.createTask({ id_product: 1, id_area: 1, sequence: 1, id_state: 1 }))
        .rejects.toThrow(BadRequestException);
    });

    it('createTask: éxito al guardar', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ id_task: 1 });
      mockRepo.save.mockResolvedValue({ id_task: 1 });
      const res = await service.createTask({ id_product: 1, id_area: 1, sequence: 1, id_state: 1 });
      expect(res).toBeDefined();
    });

    it('assignEmployee: error si ya tiene empleado asignado (Línea 110-111)', async () => {
      mockRepo.findOne.mockResolvedValue({ id_task: 1, id_employee: 99 });
      await expect(service.assignEmployee(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('⚙️ Ciclo de Vida (Start/Complete)', () => {
    it('startTask: éxito total con cascada', async () => {
      jest.spyOn(service as any, 'findPreviousTask').mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue({
        id_task: 1, id_employee: 1, id_state: TaskState.PENDING, id_product: 1, product: { id_order: 10 }
      });
      mockRepo.save.mockResolvedValue({ id_task: 1 });
      mockQueryBuilder.getRawMany.mockResolvedValue([{ id_state: 3 }]);

      const res = await service.startTask(1, 1);
      expect(res).toBeDefined();
      expect(mockDataSource.createQueryBuilder).toHaveBeenCalled();
    });

    it('completeTask: error si no está en progreso (Línea 238)', async () => {
      mockRepo.findOne.mockResolvedValue({ id_task: 1, id_employee: 1, id_state: TaskState.PENDING });
      await expect(service.completeTask(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('completeTask: éxito y actualización de cascada', async () => {
      mockRepo.findOne.mockResolvedValue({
        id_task: 1, id_employee: 1, id_state: TaskState.IN_PROGRESS, id_product: 1, product: {}
      });
      mockRepo.save.mockResolvedValue({ id_task: 1 });
      mockRepo.find.mockResolvedValue([{ id_state: TaskState.COMPLETED }]);

      const res = await service.completeTask(1, 1);
      expect(res).toBeDefined();
    });
  });

  describe('🧠 Lógica de Negocio y Helpers', () => {
    it('calculateState: lógica de estados mezclados', () => {
      const calc = (service as any).calculateState;
      expect(calc([TaskState.COMPLETED, TaskState.COMPLETED])).toBe(TaskState.COMPLETED);
      expect(calc([TaskState.COMPLETED, TaskState.PENDING])).toBe(TaskState.IN_PROGRESS);
      expect(calc([TaskState.PENDING, TaskState.PENDING])).toBe(TaskState.PENDING);
    });

    it('validateOwnership: error si el empleado no es dueño', () => {
      const task = { id_employee: 5 } as any;
      expect(() => (service as any).validateOwnership(task, 1)).toThrow(ForbiddenException);
    });

    it('validateStartState: error si ya está en proceso o terminada', () => {
      const taskInProg = { id_state: TaskState.IN_PROGRESS } as any;
      const taskDone = { id_state: TaskState.COMPLETED } as any;
      expect(() => (service as any).validateStartState(taskInProg)).toThrow(ConflictException);
      expect(() => (service as any).validateStartState(taskDone)).toThrow(BadRequestException);
    });

    it('ensurePreviousTaskCompleted: error si la anterior está pendiente', async () => {
      jest.spyOn(service as any, 'findPreviousTask').mockResolvedValue({ id_state: TaskState.PENDING });
      const task = { id_product: 1, sequence: 2 } as any;
      await expect((service as any).ensurePreviousTaskCompleted(task)).rejects.toThrow(BadRequestException);
    });

    it('getTaskOrFail: lanza NotFound si no existe (Línea 295)', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect((service as any).getTaskOrFail(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('🔁 Cascada y Base de Datos', () => {
    it('updateOrderState: sale rápido si no hay productos', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      await (service as any).updateOrderState(1);
      expect(mockQueryBuilder.execute).not.toHaveBeenCalled();
    });

    it('updateOrderState: ejecuta update si hay productos', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([{ id_state: 3 }]);
      await (service as any).updateOrderState(1);
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('findTasksByEmployee: usa queryBuilder correctamente', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([{ id_task: 1 }]);
      const res = await service.findTasksByEmployee(1);
      expect(res).toHaveLength(1);
    });

    it('deleteByProductId: ejecuta eliminación', async () => {
      mockRepo.delete.mockResolvedValue({});
      await service.deleteByProductId(1);
      expect(mockRepo.delete).toHaveBeenCalledWith({ id_product: 1 });
    });
  });
});