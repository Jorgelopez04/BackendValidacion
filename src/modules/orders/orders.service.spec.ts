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

describe('OrdersService (AAA)', () => {
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
      const action = service.findAll();
      await expect(action).rejects.toThrow(NotFoundException);
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
      const action = service.findById(99);
      await expect(action).rejects.toThrow(NotFoundException);
    });
  });

  // =========================
  // CREATE ORDER
  // =========================
  describe('createOrder', () => {
    it('debe crear orden correctamente', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

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
      const action = service.createOrder({
        id_customer: 1,
        estimated_delivery_date: pastDate,
      } as any);

      await expect(action).rejects.toThrow(BadRequestException);
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

    it('debe lanzar error si fecha es menor a entry_date', async () => {
      const order = {
        id_order: 1,
        entry_date: new Date('2026-05-01'),
        state: { name: 'Pendiente' },
        customer: { name: 'Juan' },
      };

      mockRepository.findOne.mockResolvedValue(order);

      const action = service.updateOrder(1, {
        estimated_delivery_date: new Date('2026-01-01'),
      } as any);

      await expect(action).rejects.toThrow(BadRequestException);
    });
  });

  // =========================
  // MAP TO DTO (PRIVATE) - CORREGIDO
  // =========================
  describe('mapToDto mapping logic', () => {
    it('debe mapear correctamente productos con categorías y estados', () => {
      // Arrange
      const mockOrder = {
        id_order: 1,
        state: { name: 'PROCESO' },
        customer: { name: 'Cliente Prueba' },
        products: [
          {
            id_product: 10,
            category: { name: 'Ropa' },
            state: { name: 'PENDIENTE' },
            id_order: 10 // <--- Este valor debe coincidir con el expect final
          }
        ]
      };

      // Act
      const result = (service as any).mapToDto(mockOrder);

      // Assert
      expect(result.state_name).toBe('PROCESO');
      expect(result.products[0].category_name).toBe('Ropa');
      expect(result.products[0].state_name).toBe('PENDIENTE');
      // Corregimos la expectativa: el DTO toma p.id_order y lo pone en order_id
      expect(result.products[0].order_id).toBe(10); 
    });

    it('debe manejar casos donde las relaciones son nulas', () => {
      const mockOrderMinimal = { id_order: 1 };
      const result = (service as any).mapToDto(mockOrderMinimal);
      
      expect(result.state_name).toBeUndefined();
      expect(result.products).toBeUndefined();
    });
  });
  it('createOrder: debe lanzar NotFoundException si el cliente no existe (Línea 62)', async () => {
  // Simulamos que el cliente no se encuentra
  mockCustomersService.findById.mockRejectedValue(new NotFoundException());
  
  const dto = { id_customer: 999, estimated_delivery_date: new Date('2026-12-31') };
  
  await expect(service.createOrder(dto as any)).rejects.toThrow(NotFoundException);
});
});