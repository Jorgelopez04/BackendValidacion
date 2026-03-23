import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { 
  ForbiddenException, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import 'reflect-metadata';

describe('TasksService - HIGH COVERAGE VERSION', () => {
  let service: TasksService;

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    innerJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
  };

  const mockDataSource = { createQueryBuilder: jest.fn(() => mockQueryBuilder) };
  
  const mockTaskRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  // ===============================
  // 1. FIND ALL / FIND BY ID
  // ===============================
  describe('Consultas', () => {
    it('findAll: lanza NotFound si vacío', async () => {
      mockTaskRepository.find.mockResolvedValue([]);
      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });

    it('findAll: éxito', async () => {
      mockTaskRepository.find.mockResolvedValue([{ id_task: 1 }]);
      const res = await service.findAll();
      expect(res.length).toBeGreaterThan(0);
    });

    it('findById: NotFound', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });

    it('findById: éxito', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id_task: 1 });
      const res = await service.findById(1);
      expect(res.id_task).toBe(1);
    });
  });

  // ===============================
  // 2. START TASK
  // ===============================
  describe('startTask', () => {
    it('Forbidden si no es dueño', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id_task: 1, id_employee: 5 });
      await expect(service.startTask(1, 99)).rejects.toThrow(ForbiddenException);
    });

    it('BadRequest si estado inválido', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id_task: 1, id_employee: 5, id_state: 3 });
      await expect(service.startTask(1, 5)).rejects.toThrow(BadRequestException);
    });

    it('startTask éxito', async () => {
      const task = { id_task: 1, id_employee: 5, id_state: 1 };

      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockResolvedValue({ ...task, id_state: 2 });

      const res = await service.startTask(1, 5);

      expect(res.id_state).toBe(2);
    });
    it('startTask: NotFound si no existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.startTask(1, 5))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  // ===============================
  // 3. ASSIGN EMPLOYEE
  // ===============================
  describe('assignEmployee', () => {
    it('error si ya tiene empleado', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id_task: 1, id_employee: 8 });
      await expect(service.assignEmployee(1, 10)).rejects.toThrow(BadRequestException);
    });

    it('asignación exitosa', async () => {
      const task = { id_task: 1, id_employee: null };

      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockResolvedValue({ ...task, id_employee: 10 });

      const res = await service.assignEmployee(1, 10);

      expect(res.id_employee).toBe(10);
    });
    it('assignEmployee: NotFound si no existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.assignEmployee(1, 10))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  // ===============================
  // 4. COMPLETE TASK
  // ===============================
  describe('completeTask', () => {
    it('completa y actualiza correctamente', async () => {
      const task = { 
        id_task: 1, id_employee: 5, id_state: 2,
        product: { id_product: 10, id_order: 1 }
      };

      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockResolvedValue({ ...task, id_state: 3 });

      mockTaskRepository.find.mockResolvedValue([{ id_state: 3 }]);
      mockQueryBuilder.getRawMany.mockResolvedValue([{ id_state: 3 }]);

      await service.completeTask(1, 5);

      expect(mockTaskRepository.save).toHaveBeenCalled();
      expect(mockQueryBuilder.update).toHaveBeenCalled();
    });

    it('no actualiza orden si faltan tareas', async () => {
      const task = { 
        id_task: 1, id_employee: 5, id_state: 2,
        product: { id_product: 10, id_order: 1 }
      };

      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockResolvedValue({ ...task, id_state: 3 });

      mockTaskRepository.find.mockResolvedValue([{ id_state: 2 }]); // 👈 no completadas

      await service.completeTask(1, 5);

      expect(mockQueryBuilder.update).not.toHaveBeenCalled();
    });
    it('completeTask: error si estado inválido', async () => {
      const task = { 
        id_task: 1, 
        id_employee: 5, 
        id_state: 1, // 👈 estado incorrecto para completar
        product: { id_product: 10, id_order: 1 }
      };

      mockTaskRepository.findOne.mockResolvedValue(task);

      await expect(service.completeTask(1, 5))
        .rejects
        .toThrow(BadRequestException);
    });
    it('completeTask: NotFound si no existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.completeTask(1, 5))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  // ===============================
  // 5. REMOVE
  // ===============================
  

  // ===============================
  // 6. FIND ASSIGNED TASKS
  // ===============================
  describe('findAssignedTasks', () => {
    it('retorna vacío', async () => {
      mockTaskRepository.find.mockResolvedValue([]);

      const res = await service.findAssignedTasks(5);

      expect(res).toEqual([]);
    });

    it('calcula previous_state', async () => {
      mockTaskRepository.find.mockResolvedValue([
        { id_task: 1, sequence: 1, id_product: 10, id_state: 1 }
      ]);

      const res = await service.findAssignedTasks(5);

      expect(res.length).toBeGreaterThan(0);

      if (res[0].sequence === 1) {
        expect((res[0] as any).previous_state).toBe(3);
      }
    });
  });
});