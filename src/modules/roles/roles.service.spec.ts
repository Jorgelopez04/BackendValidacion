import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();
  });

  // ===============================
  // 🔍 FIND ALL
  // ===============================
  it('findAll retorna roles', async () => {
    mockRepo.find.mockResolvedValue([{}]);

    const res = await service.findAll();
    expect(res).toBeDefined();
  });

  it('findAll lanza error si no hay roles', async () => {
    mockRepo.find.mockResolvedValue([]);

    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  // ===============================
  // 🔍 FIND BY ID
  // ===============================
  it('findById retorna rol', async () => {
    mockRepo.findOne.mockResolvedValue({});

    const res = await service.findById(1);
    expect(res).toBeDefined();
  });

  it('findById lanza error si no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });

  // ===============================
  // 🏗️ CREATE ROLE
  // ===============================
  it('createRole crea correctamente', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    mockRepo.create.mockReturnValue({});
    mockRepo.save.mockResolvedValue({});

    const res = await service.createRole({
      id_area: 1,
      name: 'Admin',
    } as any);

    expect(res).toBeDefined();
  });

  it('createRole lanza error si ya existe', async () => {
    mockRepo.findOneBy.mockResolvedValue({});

    await expect(
      service.createRole({ id_area: 1, name: 'Admin' } as any)
    ).rejects.toThrow(BadRequestException);
  });

  // ===============================
  // ✏️ UPDATE ROLE
  // ===============================
  it('updateRole actualiza correctamente', async () => {
    mockRepo.preload.mockResolvedValue({ id_area: 1 });
    mockRepo.findOneBy.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue({});

    const res = await service.updateRole(1, { name: 'Nuevo' });
    expect(res).toBeDefined();
  });

  it('updateRole lanza error si no existe', async () => {
    mockRepo.preload.mockResolvedValue(null);

    await expect(
      service.updateRole(1, {})
    ).rejects.toThrow(NotFoundException);
  });

  it('updateRole lanza error si el nombre ya existe en el área', async () => {
    mockRepo.preload.mockResolvedValue({ id_area: 1 });
    mockRepo.findOneBy.mockResolvedValue({}); // ya existe otro con ese nombre

    await expect(
      service.updateRole(1, { name: 'Duplicado' })
    ).rejects.toThrow(BadRequestException);
  });

  // ===============================
  // ❌ DELETE ROLE
  // ===============================
  it('deleteRole elimina correctamente', async () => {
    mockRepo.findOne.mockResolvedValue({ employees: [] });
    mockRepo.remove.mockResolvedValue({});

    const res = await service.deleteRole(1);
    expect(res).toBeDefined();
  });

  it('deleteRole lanza error si no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteRole(1)).rejects.toThrow(NotFoundException);
  });

  it('deleteRole lanza error si tiene empleados', async () => {
    mockRepo.findOne.mockResolvedValue({ employees: [{}] });

    await expect(service.deleteRole(1)).rejects.toThrow(BadRequestException);
  });
});