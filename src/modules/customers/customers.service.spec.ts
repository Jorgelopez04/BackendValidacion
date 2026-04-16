import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let repo: jest.Mocked<Repository<Customer>>;

  const mockRepo = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repo = module.get(getRepositoryToken(Customer));

    jest.clearAllMocks();
  });

  // =========================
  // FIND ALL
  // =========================
  describe('findAll', () => {
    it('retorna clientes', async () => {
      repo.find.mockResolvedValue([{ id_customer: 1, name: 'Juan' }] as any);

      const res = await service.findAll();
      expect(res.length).toBe(1);
    });

    it('lanza error si no hay clientes', async () => {
      repo.find.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  // =========================
  // FIND BY ID
  // =========================
  describe('findById', () => {
    it('retorna cliente', async () => {
      repo.findOneBy.mockResolvedValue({ id_customer: 1, name: 'Juan' } as any);

      const res = await service.findById(1);
      expect(res).toBeDefined();
    });

    it('lanza error si no existe', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  // =========================
  // CREATE
  // =========================
  describe('createCustomer', () => {
    it('crea cliente correctamente', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ name: 'Juan' } as any);
      repo.save.mockResolvedValue({ id_customer: 1, name: 'Juan' } as any);

      const res = await service.createCustomer({ name: 'Juan' } as any);

      expect(res).toBeDefined();
      expect(repo.save).toHaveBeenCalled();
    });

    it('lanza error si el nombre ya existe', async () => {
      repo.findOne.mockResolvedValue({ id_customer: 1 } as any);

      await expect(
        service.createCustomer({ name: 'Juan' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  // =========================
  // UPDATE
  // =========================
  describe('updateCustomer', () => {
    it('actualiza correctamente', async () => {
      repo.preload.mockResolvedValue({ id_customer: 1, name: 'Old' } as any);
      repo.findOne.mockResolvedValue(null);
      repo.save.mockResolvedValue({ id_customer: 1, name: 'New' } as any);

      const res = await service.updateCustomer(1, { name: 'New' } as any);

      expect(res).toBeDefined();
    });

    it('lanza error si no existe', async () => {
      repo.preload.mockResolvedValue(undefined);

      await expect(
        service.updateCustomer(1, { name: 'New' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el nombre ya existe en otro cliente', async () => {
      repo.preload.mockResolvedValue({ id_customer: 1, name: 'Old' } as any);
      repo.findOne.mockResolvedValue({ id_customer: 2, name: 'New' } as any);

      await expect(
        service.updateCustomer(1, { name: 'New' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('permite mismo nombre si es el mismo cliente', async () => {
      repo.preload.mockResolvedValue({ id_customer: 1, name: 'Old' } as any);
      repo.findOne.mockResolvedValue({ id_customer: 1, name: 'Old' } as any);
      repo.save.mockResolvedValue({ id_customer: 1, name: 'Old' } as any);

      const res = await service.updateCustomer(1, { name: 'Old' } as any);

      expect(res).toBeDefined();
    });
  });
});