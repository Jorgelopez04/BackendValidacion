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

  const mockDataSource = { 
    createQueryBuilder: jest.fn(() => mockQueryBuilder) 
  };
  
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
  // 1. CONSULTAS
  // ===============================
  describe('Consultas', () => {
    it('findAll: éxito', async () => {
      mockTaskRepository.find.mockResolvedValue([{ id_task: 1 }]);
      const res = await service.findAll();
      expect(res.length).toBeGreaterThan(0);
    });

    it('findById: éxito', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id_task: 1 });
      const res = await service.findById(1);
      expect(res.id_task).toBe(1);
    });

    it('findById: lanza NotFound si no existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ===============================
  // 2. CREACIÓN (Cubre líneas rojas de SonarQube)
  // ===============================
  describe('createTask', () => {
    it('lanza BadRequest si la secuencia ya existe', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id_task: 100 });
      await expect(service.createTask({ id_product: 1, sequence: 1 } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('crea tarea exitosamente', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);
      mockTaskRepository.create.mockReturnValue({ id_task: 1 });
      mockTaskRepository.save.mockResolvedValue({ id_task: 1 });
      
      const res = await service.createTask({ id_product: 1, sequence: 1 } as any);
      expect(res.id_task).toBe(1);
    });
  });

  // ===============================
  // 3. START TASK (Lógica de tarea previa)
  // ===============================
  describe('startTask', () => {
    it('Forbidden si el empleado no coincide', async () => {
      mockTaskRepository.findOne.mockResolvedValue({ id_task: 1, id_employee: 5 });
      await expect(service.startTask(1, 99)).rejects.toThrow(ForbiddenException);
    });

    it('éxito si es la primera tarea (secuencia 1)', async () => {
      const task = { id_task: 1, sequence: 1, id_employee: 5, id_state: 1 };
      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockResolvedValue({ ...task, id_state: 2 });

      const res = await service.startTask(1, 5);
      expect(res.id_state).toBe(2);
    });

    it('éxito si la tarea anterior está COMPLETED', async () => {
      const task = { id_task: 2, sequence: 2, id_employee: 5, id_state: 1, id_product: 10 };
      const prevTask = { id_task: 1, sequence: 1, id_state: 3 }; // Estado 3 = Completado

      mockTaskRepository.findOne
        .mockResolvedValueOnce(task)      // Primera llamada: tarea actual
        .mockResolvedValueOnce(prevTask);  // Segunda llamada: tarea previa

      mockTaskRepository.save.mockResolvedValue({ ...task, id_state: 2 });

      const res = await service.startTask(2, 5);
      expect(res.id_state).toBe(2);
    });
  });

  // ===============================
  // 4. COMPLETE TASK
  // ===============================
  describe('completeTask', () => {
    it('completa tarea y actualiza producto/orden', async () => {
      const task = { 
        id_task: 1, id_employee: 5, id_state: 2,
        product: { id_product: 10, id_order: 1 }
      };

      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockResolvedValue({ ...task, id_state: 3 });
      mockTaskRepository.find.mockResolvedValue([{ id_state: 3 }]);
      mockQueryBuilder.getRawMany.mockResolvedValue([{ id_state: 3 }]);

      await service.completeTask(1, 5);
      expect(mockTaskRepository.save).toHaveBeenCal led();
      expect(mockQueryBuilder.update).toHaveBeenCalled();
    });
  });

  // ===============================
  // 5. ASIGNACIÓN
  // ===============================
  describe('assignEmployee', () => {
    it('asigna empleado correctamente', async () => {
      const task = { id_task: 1, id_employee: null };
      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.save.mockResolvedValue({ ...task, id_employee: 10 });

      const res = await service.assignEmployee(1, 10);
      expect(res.id_employee).toBe(10);
    });
  });
});