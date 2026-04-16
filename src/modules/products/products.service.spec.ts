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

describe('ProductsService - Cobertura Máxima (AAA)', () => {
  let service: ProductsService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
  };

  const mockOrdersService = { findById: jest.fn() };
  const mockCategoriesService = { findById: jest.fn() };
  const mockFlowsService = { findByCategoryOrderBySequence: jest.fn() };
  const mockTasksService = { createTask: jest.fn(), assignEmployee: jest.fn() };
  const mockEmployeesService = { findEmployeeWithLeastWorkload: jest.fn() };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // CP01: findAll
  // ==========================================
  it('findAll: retorna lista correctamente', async () => {
    // Arrange
    const mockData = [{ id_product: 1, name: 'Sofa' }];
    mockRepo.find.mockResolvedValue(mockData);

    // Act
    const result = await service.findAll();

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].id_product).toBe(1);
    expect(result[0].name).toBe('Sofa');
    expect(mockRepo.find).toHaveBeenCalled();
  });

  it('findAll: lanza error si no hay productos', async () => {
    // Arrange
    mockRepo.find.mockResolvedValue([]);

    // Act & Assert
    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  // ==========================================
  // CP02: findById
  // ==========================================
  it('findById: error si no existe', async () => {
    // Arrange
    mockRepo.findOne.mockResolvedValue(undefined);

    // Act & Assert
    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });

  it('findById: retorna producto', async () => {
    // Arrange
    const mockProduct = { id_product: 1, name: 'Mesa' };
    mockRepo.findOne.mockResolvedValue(mockProduct);

    // Act
    const result = await service.findById(1);

    // Assert
    expect(result).toBeDefined();
    expect(result.id_product).toBe(1);
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { id_product: 1 },
      relations: ['order', 'category', 'state'],
    });
  });

  // ==========================================
  // CP03: createProduct
  // ==========================================
  it('createProduct: error si orden no existe', async () => {
    // Arrange
    mockOrdersService.findById.mockRejectedValue(new NotFoundException());

    // Act & Assert
    await expect(
      service.createProduct({ id_order: 999, id_category: 1 } as any)
    ).rejects.toThrow(NotFoundException);
  });

  it('createProduct: error si categoría no existe', async () => {
    // Arrange
    mockOrdersService.findById.mockResolvedValue({ id_order: 1 });
    mockCategoriesService.findById.mockRejectedValue(new NotFoundException());

    // Act & Assert
    await expect(
      service.createProduct({ id_order: 1, id_category: 999 } as any)
    ).rejects.toThrow(NotFoundException);
  });

  it('createProduct: error si no hay flujos', async () => {
    // Arrange
    mockOrdersService.findById.mockResolvedValue({ id_order: 1 });
    mockCategoriesService.findById.mockResolvedValue({ id_category: 1 });
    mockRepo.save.mockResolvedValue({ id_product: 10 });
    mockFlowsService.findByCategoryOrderBySequence.mockResolvedValue([]);

    // Act & Assert
    await expect(
      service.createProduct({ id_order: 1, id_category: 1 } as any)
    ).rejects.toThrow(BadRequestException);
  });

  it('createProduct: crea tareas y asigna empleados', async () => {
    // Arrange
    const productDto = { id_order: 1, id_category: 1, name: 'Sofa Test' };

    mockOrdersService.findById.mockResolvedValue({ id_order: 1 });
    mockCategoriesService.findById.mockResolvedValue({ id_category: 1 });

    mockRepo.save.mockResolvedValue({ id_product: 10, ...productDto });
    mockRepo.findOne.mockResolvedValue({ id_product: 10, ...productDto });

    mockFlowsService.findByCategoryOrderBySequence.mockResolvedValue([
      { id_role: 1, sequence: 1, role: { id_area: 1 } },
      { id_role: 2, sequence: 2, role: { id_area: 2 } },
    ]);

    mockEmployeesService.findEmployeeWithLeastWorkload.mockResolvedValue({ id_employee: 5 });
    mockTasksService.createTask.mockResolvedValue({ id_task: 100 });

    // Act
    const result = await service.createProduct(productDto as any);

    // Assert
    expect(result).toBeDefined();
    expect(mockTasksService.createTask).toHaveBeenCalledTimes(2);
    expect(mockTasksService.assignEmployee).toHaveBeenCalledTimes(2);
  });

  // ==========================================
  // CP04: updateProduct
  // ==========================================
  it('updateProduct: error si no existe', async () => {
    // Arrange
    mockRepo.preload.mockResolvedValue(undefined);

    // Act & Assert
    await expect(
      service.updateProduct(1, { name: 'Test' } as any)
    ).rejects.toThrow(NotFoundException);
  });

  it('updateProduct: error si está en producción', async () => {
    // Arrange
    mockRepo.preload.mockResolvedValue({ id_product: 1, id_state: 2 });

    // Act & Assert
    await expect(
      service.updateProduct(1, { name: 'Edit' } as any)
    ).rejects.toThrow(BadRequestException);
  });

  it('updateProduct: actualiza correctamente', async () => {
    // Arrange
    const updatedProduct = { id_product: 1, id_state: 1, name: 'Actualizado' };
    mockRepo.preload.mockResolvedValue(updatedProduct);
    mockRepo.save.mockResolvedValue(updatedProduct);

    // Act
    const result = await service.updateProduct(1, { name: 'Actualizado' } as any);

    // Assert
    expect(result.name).toBe('Actualizado');
    expect(mockRepo.save).toHaveBeenCalled();
  });
});