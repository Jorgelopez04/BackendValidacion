import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { OrdersService } from '../orders/orders.service';
import { CategoriesService } from '../categories/categories.service';
import { FlowsService } from '../flows/flows.service';
import { TasksService } from '../tasks/tasks.service';
import { EmployeesService } from '../employees/employees.service';

describe('ProductsService (Unit Tests Refactored)', () => {
  let service: ProductsService;
  let repo: any;
  let flowsService: any;
  let tasksService: any;

  // Mocks de servicios dependientes
  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn(),
    preload: jest.fn(),
  };

  const mockOrdersService = { findById: jest.fn().mockResolvedValue({ id_order: 1 }) };
  const mockCategoriesService = { findById: jest.fn().mockResolvedValue({ id_category: 1, name: 'Camisetas' }) };
  const mockFlowsService = { findByCategoryOrderBySequence: jest.fn() };
  const mockTasksService = {
    createTask: jest.fn(),
    assignEmployee: jest.fn(),
  };
  const mockEmployeesService = { findEmployeeWithLeastWorkload: jest.fn().mockResolvedValue({ id_employee: 7 }) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepo },
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: FlowsService, useValue: mockFlowsService },
        { provide: TasksService, useValue: mockTasksService },
        { provide: EmployeesService, useValue: mockEmployeesService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repo = mockRepo;
    flowsService = mockFlowsService;
    tasksService = mockTasksService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBAS CP01: findAll ---
  it('CP01: findAll - debe lanzar NotFoundException si no hay productos', async () => {
    repo.find.mockResolvedValue([]);
    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  // --- PRUEBAS CP02: findById ---
  it('CP02: findById - debe lanzar NotFoundException si el producto no existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findById(99)).rejects.toThrow(NotFoundException);
  });

  // --- PRUEBAS CP03: createProduct ---
  it('CP03: createProduct - debe lanzar BadRequestException si no hay flujos', async () => {
    repo.save.mockResolvedValue({ id_product: 1, id_category: 1 });
    flowsService.findByCategoryOrderBySequence.mockResolvedValue([]); // Camino de error (Caja Blanca)

    await expect(service.createProduct({ id_order: 1, id_category: 1, name: 'Test' } as any))
      .rejects.toThrow(BadRequestException);
  });

  it('CP03: createProduct - debe crear tareas y empleados (Bucle)', async () => {
    const productData = { id_product: 1, id_category: 1 };
    repo.save.mockResolvedValue(productData);
    repo.findOne.mockResolvedValue(productData); // Para el findById final
    
    // Simulamos 2 flujos para probar el bucle (M = 3)
    flowsService.findByCategoryOrderBySequence.mockResolvedValue([
      { sequence: 1, id_role: 3, role: { id_area: 1 } },
      { sequence: 2, id_role: 4, role: { id_area: 2 } }
    ]);
    
    tasksService.createTask.mockResolvedValue({ id_task: 100 });

    const result = await service.createProduct({ id_order: 1, id_category: 1 } as any);

    expect(tasksService.assignEmployee).toHaveBeenCalledTimes(2); // Verifica el bucle
    expect(result).toBeDefined();
  });

  // --- PRUEBAS CP04: updateProduct ---
  it('CP04: updateProduct - debe lanzar NotFoundException si no existe (Preload)', async () => {
    repo.preload.mockResolvedValue(null);
    await expect(service.updateProduct(1, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('CP04: updateProduct - debe lanzar BadRequestException si id_state != 1', async () => {
    repo.preload.mockResolvedValue({ id_product: 1, id_state: 2 }); // Ya en producción
    await expect(service.updateProduct(1, {} as any)).rejects.toThrow(BadRequestException);
  });

  it('CP04: updateProduct - debe actualizar con éxito si estado es 1', async () => {
    const updated = { id_product: 1, id_state: 1, name: 'Editado' };
    repo.preload.mockResolvedValue(updated);
    repo.save.mockResolvedValue(updated);

    const result = await service.updateProduct(1, { name: 'Editado' } as any);
    expect(result.name).toBe('Editado');
    expect(repo.save).toHaveBeenCalled();
  });
});