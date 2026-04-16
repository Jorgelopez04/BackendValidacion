import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlowsService } from './flows.service';
import { Flow } from './entities/flow.entity';
import { RolesService } from '../roles/roles.service';
import { CategoriesService } from '../categories/categories.service';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('FlowsService - FULL COVERAGE', () => {
  let service: FlowsService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleService = {
    findById: jest.fn(),
  };

  const mockCategoryService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlowsService,
        { provide: getRepositoryToken(Flow), useValue: mockRepo },
        { provide: RolesService, useValue: mockRoleService },
        { provide: CategoriesService, useValue: mockCategoryService },
      ],
    }).compile();

    service = module.get<FlowsService>(FlowsService);
    jest.clearAllMocks();
  });

  // ===============================
  // 🔍 FIND ALL
  // ===============================

  it('findAll error si vacío', async () => {
    mockRepo.find.mockResolvedValue([]);

    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  it('findAll OK', async () => {
    mockRepo.find.mockResolvedValue([{}]);

    const res = await service.findAll();

    expect(res).toBeDefined();
  });

  // ===============================
  // 🔍 FIND BY ID
  // ===============================

  it('findById error', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });

  it('findById OK', async () => {
    mockRepo.findOne.mockResolvedValue({});

    const res = await service.findById(1);

    expect(res).toBeDefined();
  });

  // ===============================
  // 🏗️ CREATE FLOW
  // ===============================

  it('createFlow error rol no existe', async () => {
    mockRoleService.findById.mockResolvedValue(null);

    await expect(
      service.createFlow({
        id_role: 1,
        id_category: 1,
        sequence: 1,
      } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('createFlow error categoría no existe', async () => {
    mockRoleService.findById.mockResolvedValue({});
    mockCategoryService.findById.mockResolvedValue(null);

    await expect(
      service.createFlow({
        id_role: 1,
        id_category: 1,
        sequence: 1,
      } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('createFlow error rol duplicado', async () => {
    mockRoleService.findById.mockResolvedValue({});
    mockCategoryService.findById.mockResolvedValue({});
    mockRepo.findOne.mockResolvedValueOnce({});

    await expect(
      service.createFlow({
        id_role: 1,
        id_category: 1,
        sequence: 1,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('createFlow error secuencia duplicada', async () => {
    mockRoleService.findById.mockResolvedValue({});
    mockCategoryService.findById.mockResolvedValue({});
    mockRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({});

    await expect(
      service.createFlow({
        id_role: 1,
        id_category: 1,
        sequence: 1,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('createFlow OK', async () => {
    mockRoleService.findById.mockResolvedValue({});
    mockCategoryService.findById.mockResolvedValue({});
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue({});
    mockRepo.save.mockResolvedValue({});

    const res = await service.createFlow({
      id_role: 1,
      id_category: 1,
      sequence: 1,
    } as any);

    expect(res).toBeDefined();
  });

  // ===============================
  // 🔄 UPDATE FLOW
  // ===============================

  it('updateFlow error no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.updateFlow(1, {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updateFlow error rol no existe', async () => {
    mockRepo.findOne.mockResolvedValue({
      id_flow: 1,
      id_role: 1,
      id_category: 1,
      sequence: 1,
    });

    mockRoleService.findById.mockResolvedValue(null);

    await expect(service.updateFlow(1, { id_role: 2 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updateFlow error rol duplicado', async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({
        id_flow: 1,
        id_role: 1,
        id_category: 1,
        sequence: 1,
      })
      .mockResolvedValueOnce({});

    mockRoleService.findById.mockResolvedValue({});

    await expect(service.updateFlow(1, { id_role: 2 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updateFlow error secuencia duplicada', async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({
        id_flow: 1,
        id_role: 1,
        id_category: 1,
        sequence: 1,
      })
      .mockResolvedValueOnce({});

    await expect(service.updateFlow(1, { sequence: 2 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updateFlow OK', async () => {
    mockRepo.findOne.mockResolvedValue({
      id_flow: 1,
      id_role: 1,
      id_category: 1,
      sequence: 1,
    });

    mockRepo.save.mockResolvedValue({});

    const res = await service.updateFlow(1, {});

    expect(res).toBeDefined();
  });

  // 🔥 NUEVOS TESTS (LOS QUE TE FALTABAN)

  it('updateFlow: no entra a validaciones si valores son iguales', async () => {
    const existingFlow = {
      id_flow: 1,
      id_role: 1,
      id_category: 1,
      sequence: 1,
    };

    mockRepo.findOne.mockResolvedValue(existingFlow);
    mockRepo.save.mockResolvedValue(existingFlow);

    const result = await service.updateFlow(1, {
      id_role: 1,
      sequence: 1,
    });

    expect(result).toBeDefined();
  });

  it('updateFlow: no entra a validaciones si no se envían campos', async () => {
    const existingFlow = {
      id_flow: 1,
      id_role: 1,
      id_category: 1,
      sequence: 1,
    };

    mockRepo.findOne.mockResolvedValue(existingFlow);
    mockRepo.save.mockResolvedValue(existingFlow);

    const result = await service.updateFlow(1, {});

    expect(result).toBeDefined();
  });

  // ===============================
  // 🧹 DELETE
  // ===============================

  it('deleteFlow siempre lanza error', async () => {
    await expect(service.deleteFlow()).rejects.toThrow(
      BadRequestException,
    );
  });

  // ===============================
  // 🔍 EXTRA
  // ===============================

  it('findByCategoryOrderBySequence OK', async () => {
    mockRepo.find.mockResolvedValue([{}]);

    const res = await service.findByCategoryOrderBySequence(1);

    expect(res).toBeDefined();
  });

  it('findByCategory: debe lanzar NotFoundException si la categoría no existe', async () => {
    mockRepo.find.mockResolvedValue([]);

    await expect(
      service.findByCategoryOrderBySequence(999),
    ).rejects.toThrow(NotFoundException);
  });
});