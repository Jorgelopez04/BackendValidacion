// ✅ Mock de bcrypt (debe permanecer en el top del archivo)
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee, States } from './entities/employee.entity';
import { RolesService } from '../roles/roles.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('EmployeesService', () => {
  let service: EmployeesService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    preload: jest.fn(),
  };

  const mockRolesService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
        { provide: RolesService, useValue: mockRolesService },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    jest.clearAllMocks();
  });

  // ===============================
  // 🔍 FIND ALL
  // ===============================
  it('findAll retorna empleados', async () => {
    mockRepo.find.mockResolvedValue([{}]);

    const res = await service.findAll();
    expect(res).toBeDefined();
  });

  it('findAll lanza error si no hay empleados', async () => {
    mockRepo.find.mockResolvedValue([]);
    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  // ===============================
  // 🔍 FIND BY ID
  // ===============================
  it('findById retorna empleado', async () => {
    mockRepo.findOne.mockResolvedValue({});
    const res = await service.findById(1);
    expect(res).toBeDefined();
  });

  it('findById lanza error si no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });

  // ===============================
  // 🔍 FIND BY CC
  // ===============================
  it('findByCc retorna empleado', async () => {
    mockRepo.findOne.mockResolvedValue({});
    const res = await service.findByCc('123');
    expect(res).toBeDefined();
  });

  it('findByCc lanza error si no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findByCc('123')).rejects.toThrow(NotFoundException);
  });

  // ===============================
  // 🏗️ CREATE EMPLOYEE
  // ===============================
  it('createEmployee crea correctamente', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    mockRolesService.findById.mockResolvedValue({ id_role: 1 });
    mockRepo.create.mockReturnValue({});
    mockRepo.save.mockResolvedValue({});

    const res = await service.createEmployee({
      cc: '123',
      password: '123',
      id_role: 1,
    } as any);

    expect(res).toBeDefined();
    expect(bcrypt.hash).toHaveBeenCalledWith('123', expect.any(Number));
  });

  it('createEmployee lanza error si ya existe', async () => {
    mockRepo.findOneBy.mockResolvedValue({});
    await expect(service.createEmployee({ cc: '123' } as any)).rejects.toThrow(BadRequestException);
  });

  // ===============================
  // ✏️ UPDATE EMPLOYEE
  // ===============================
  it('updateEmployee actualiza correctamente', async () => {
    mockRepo.preload.mockResolvedValue({});
    mockRepo.save.mockResolvedValue({});
    const res = await service.updateEmployee(1, {});
    expect(res).toBeDefined();
  });

  it('updateEmployee lanza error si no existe', async () => {
    mockRepo.preload.mockResolvedValue(null);
    await expect(service.updateEmployee(1, {})).rejects.toThrow(NotFoundException);
  });

  it('updateEmployee hashea password si viene', async () => {
    mockRepo.preload.mockResolvedValue({});
    mockRepo.save.mockResolvedValue({});
    const res = await service.updateEmployee(1, { password: '123' } as any);
    expect(res).toBeDefined();
    expect(bcrypt.hash).toHaveBeenCalledWith('123', expect.any(Number));
  });

  // ===============================
  // ❌ DELETE EMPLOYEE
  // ===============================
  it('deleteEmployee elimina correctamente', async () => {
    const employeeMock = { state: States.ACTIVE };
    mockRepo.findOneBy.mockResolvedValue(employeeMock);
    mockRepo.save.mockResolvedValue(employeeMock);

    const res = await service.deleteEmployee(1);
    expect(res).toBeDefined();
    expect(employeeMock.state).toBe(States.INACTIVE);
    expect(mockRepo.save).toHaveBeenCalledWith(employeeMock);
  });

  it('deleteEmployee no cambia estado si ya está INACTIVE', async () => {
    const employeeMock = { state: States.INACTIVE };
    mockRepo.findOneBy.mockResolvedValue(employeeMock);
    mockRepo.save.mockResolvedValue(employeeMock);

    const res = await service.deleteEmployee(1);
    expect(res).toBeDefined();
    expect(employeeMock.state).toBe(States.INACTIVE);
  });

  it('deleteEmployee lanza error si no existe', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    await expect(service.deleteEmployee(1)).rejects.toThrow(NotFoundException);
  });

  // ===============================
  // ⚙️ WORKLOAD
  // ===============================
  it('findEmployeeWithLeastWorkload retorna empleado', async () => {
    mockRolesService.findById.mockResolvedValue({});
    mockRepo.find.mockResolvedValue([
      { tasks: [{ id_state: 1 }, { id_state: 2 }] },
      { tasks: [] },
    ]);
    const res = await service.findEmployeeWithLeastWorkload(1);
    expect(res).toBeDefined();
  });

  it('findEmployeeWithLeastWorkload lanza error si no hay empleados', async () => {
    mockRolesService.findById.mockResolvedValue({});
    mockRepo.find.mockResolvedValue([]);
    await expect(service.findEmployeeWithLeastWorkload(1)).rejects.toThrow(NotFoundException);
  });

  it('findEmployeeWithLeastWorkload: empleados sin tareas activas', async () => {
    mockRolesService.findById.mockResolvedValue({});
    mockRepo.find.mockResolvedValue([
      { tasks: [{ id_state: 3 }, { id_state: 4 }] },
      { tasks: [] },
    ]);
    const res = await service.findEmployeeWithLeastWorkload(1);
    expect(res).toBeDefined();
  });

  it('findEmployeeWithLeastWorkload lanza error si no hay empleados para el rol', async () => {
    mockRepo.find.mockResolvedValue([]);
    await expect(service.findEmployeeWithLeastWorkload(999)).rejects.toThrow(NotFoundException);
  });
});