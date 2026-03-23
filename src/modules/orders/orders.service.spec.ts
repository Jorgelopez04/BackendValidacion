jest.mock('./entities/order.entity', () => ({
  Order: class {},
}));
jest.mock('../customers/customers.service', () => ({
  CustomersService: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
  })),
}));
jest.mock('src/common/entities/state.entity', () => ({
  State: class {},
}));
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;
  let customersService: CustomersService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCustomersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
    customersService = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // FIND ALL
  // =========================
  describe('findAll', () => {
    it('debe retornar lista de órdenes', async () => {
      const mockOrders = [
        {
          id_order: 1,
          state: { name: 'Pendiente' },
          customer: { name: 'Juan' },
        },
      ];

      mockRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result.length).toBe(1);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si no hay órdenes', async () => {
      mockRepository.find.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  // =========================
  // FIND BY ID
  // =========================
  describe('findById', () => {
    it('debe retornar orden si existe', async () => {
      const mockOrder = {
        id_order: 1,
        state: { name: 'Pendiente' },
        customer: { name: 'Juan' },
        products: [],
      };

      mockRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findById(1);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================
  // CREATE ORDER
  // =========================
  describe('createOrder', () => {
    it('debe crear orden correctamente', async () => {
      const futureDate = new Date(Date.now() + 100000);

      mockCustomersService.findById.mockResolvedValue({});
      mockRepository.create.mockReturnValue({ id_order: 1 });
      mockRepository.save.mockResolvedValue({ id_order: 1 });
      mockRepository.findOne.mockResolvedValue({
        id_order: 1,
        state: { name: 'Pendiente' },
        customer: { name: 'Juan' },
      });

      const result = await service.createOrder({
        id_customer: 1,
        estimated_delivery_date: futureDate,
      } as any);

      expect(result).toBeDefined();
      expect(customersService.findById).toHaveBeenCalled();
    });

    it('debe lanzar error si la fecha es pasada', async () => {
      const pastDate = new Date('2000-01-01');

      await expect(
        service.createOrder({
          id_customer: 1,
          estimated_delivery_date: pastDate,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================
  // UPDATE ORDER
  // =========================
  describe('updateOrder', () => {
    it('debe actualizar correctamente', async () => {
      const order = {
        id_order: 1,
        entry_date: new Date('2026-01-01'),
        state: { name: 'Pendiente' },
        customer: { name: 'Juan' },
      };

      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockResolvedValue(order);

      const result = await service.updateOrder(1, {
        estimated_delivery_date: new Date('2026-02-01'),
      } as any);

      expect(result).toBeDefined();
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateOrder(99, {
          estimated_delivery_date: new Date(),
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar error si fecha es menor a entry_date', async () => {
      const order = {
        id_order: 1,
        entry_date: new Date('2026-05-01'),
        state: { name: 'Pendiente' },
        customer: { name: 'Juan' },
      };

      mockRepository.findOne.mockResolvedValue(order);

      await expect(
        service.updateOrder(1, {
          estimated_delivery_date: new Date('2026-01-01'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});