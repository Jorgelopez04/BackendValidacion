import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import 'reflect-metadata';

describe('TasksService - FULL COVERAGE', () => {
  let service: TasksService;

  const mockQueryBuilder: any = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([{ id_task: 1, product_name: 'Camisa' }]),
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

  // ===============================
  // 🔍 FIND
  // ===============================

  it('findAll OK', async () => {
    mockRepo.find.mockResolvedValue([{ id_task: 1 }]);

    const res = await service.findAll();

    expect(res).toBeDefined();
  });

  it('findAll ERROR', async () => {
    mockRepo.find.mockResolvedValue([]);

    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  it('findById OK', async () => {
    mockRepo.findOne.mockResolvedValue({ id_task: 1 });

    const res = await service.findById(1);

    expect(res).toBeDefined();
  });

  it('findById ERROR', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toThrow(NotFoundException);
  });

  // ===============================
  // 🏗️ CREATE
  // ===============================

  it('createTask OK', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue({ id_task: 1 });
    mockRepo.save.mockResolvedValue({ id_task: 1 });

    const res = await service.createTask({
      id_product: 1,
      id_area: 1,
      sequence: 1,
      id_state: 1,
    });

    expect(res).toBeDefined();
  });

  it('createTask ERROR duplicado', async () => {
    mockRepo.findOne.mockResolvedValue({ id_task: 1 });

    await expect(
      service.createTask({
        id_product: 1,
        id_area: 1,
        sequence: 1,
        id_state: 1,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ===============================
  // 👷 ASSIGN
  // ===============================

  it('assignEmployee OK', async () => {
    mockRepo.findOne.mockResolvedValue({
      id_task: 1,
      id_employee: null,
    });

    mockRepo.save.mockResolvedValue({ id_employee: 5 });

    const res = await service.assignEmployee(1, 5);

    expect(res.id_employee).toBe(5);
  });

  it('assignEmployee ERROR ya asignado', async () => {
    mockRepo.findOne.mockResolvedValue({
      id_task: 1,
      id_employee: 2,
    });

    await expect(service.assignEmployee(1, 5)).rejects.toThrow(BadRequestException);
  });

  // ===============================
  // ▶️ START TASK
  // ===============================

  it('startTask OK', async () => {
    const task = {
      id_task: 1,
      id_employee: 1,
      id_state: 1,
      sequence: 1,
      id_product: 10,
      product: { id_product: 10, order: { id_order: 1 } },
    };

    mockRepo.findOne.mockResolvedValue(task);
    mockRepo.save.mockResolvedValue({ ...task, id_state: 2 });

    const res = await service.startTask(1, 1);

    expect(res).toBeDefined();
  });

  it('startTask ERROR ownership', async () => {
    mockRepo.findOne.mockResolvedValue({
      id_task: 1,
      id_employee: 2,
    });

    await expect(service.startTask(1, 1)).rejects.toThrow(ForbiddenException);
  });

  it('startTask ERROR ya en progreso', async () => {
    mockRepo.findOne.mockResolvedValue({
      id_task: 1,
      id_employee: 1,
      id_state: 2,
      sequence: 1,
      id_product: 1,
    });

    await expect(service.startTask(1, 1)).rejects.toThrow(ConflictException);
  });

  it('startTask ERROR tarea previa no completada', async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({
        id_task: 2,
        id_employee: 1,
        id_state: 1,
        sequence: 2,
        id_product: 1,
      })
      .mockResolvedValueOnce({
        id_task: 1,
        id_state: 1,
      });

    await expect(service.startTask(2, 1)).rejects.toThrow(BadRequestException);
  });

  // ===============================
  // ✅ COMPLETE TASK
  // ===============================

  it('completeTask OK', async () => {
    const task = {
      id_task: 1,
      id_employee: 1,
      id_state: 2,
      id_product: 1,
      product: { id_product: 1, order: { id_order: 1 } },
    };

    mockRepo.findOne.mockResolvedValue(task);
    mockRepo.save.mockResolvedValue({ ...task, id_state: 3 });

    const res = await service.completeTask(1, 1);

    expect(res).toBeDefined();
  });

  it('completeTask ERROR no iniciada', async () => {
    mockRepo.findOne.mockResolvedValue({
      id_task: 1,
      id_employee: 1,
      id_state: 1,
    });

    await expect(service.completeTask(1, 1)).rejects.toThrow(BadRequestException);
  });

  it('completeTask ERROR ya completada', async () => {
    mockRepo.findOne.mockResolvedValue({
      id_task: 1,
      id_employee: 1,
      id_state: 3,
    });

    await expect(service.completeTask(1, 1)).rejects.toThrow(ConflictException);
  });

  // ===============================
  // 📊 REPORTES
  // ===============================

  it('findTasksByEmployee OK', async () => {
    const res = await service.findTasksByEmployee(1);

    expect(res[0].product_name).toBe('Camisa');
  });

  // ===============================
  // 🧹 OTROS
  // ===============================

  it('deleteByProductId', async () => {
    mockRepo.delete.mockResolvedValue({});

    await service.deleteByProductId(1);

    expect(mockRepo.delete).toHaveBeenCalled();
  });
});