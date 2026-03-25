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

describe('ProductsService - Cobertura Optimizada', () => {
  let service: ProductsService;

  // Mocks simplificados para evitar errores de tipos
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
        // Usamos 'as any' para eliminar los 119 errores de TypeScript en el editor
        { provide: getRepositoryToken(Product), useValue: mockRepo as any },
        { provide: OrdersService, useValue: mockOrdersService as any },
        { provide: CategoriesService, useValue: mockCategoriesService as any },
        { provide: FlowsService, useValue: mockFlowsService as any },
        { provide: TasksService, useValue: mockTasksService as any },
        { provide: EmployeesService, useValue: mockEmployeesService as any },
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
  it('findAll: debe retornar lista y cubrir el mapeo de datos', async () => {
    // Arrange
    const mockData = [{ id_product: 1, name: 'Sofa' }];
    mockRepo.find.mockResolvedValue(mockData);

    // Act
    const result = await service.findAll();

    // Assert
    expect(result).toEqual(mockData);
    expect(mockRepo.find).toHaveBeenCalled();
  });

  // ==========================================
  // CP03: createProduct (Lógica de Bucle y Asignación)
  // ==========================================
  it('createProduct: ERROR - lanza BadRequest si la categoría no tiene flujos', async () => {
    // Arrange
    mockOrdersService.findById.mockResolvedValue({ id_order: 1 });
    mockCategoriesService.findById.mockResolvedValue({ id_category: 1 });
    mockRepo.save.mockResolvedValue({ id_product: 10, id_category: 1 });
    mockFlowsService.findByCategoryOrderBySequence.mockResolvedValue([]); 

    // Act & Assert
    await expect(service.createProduct({ id_order: 1, id_category: 1 } as any))
      .rejects.toThrow(BadRequestException);
  });

  it('createProduct: ÉXITO - cubre el bucle de flujos y creación de tareas', async () => {
    // Arrange
    const productDto = { id_order: 1, id_category: 1, name: 'Sofa Test' };
    mockOrdersService.findById.mockResolvedValue({ id_order: 1 });
    mockCategoriesService.findById.mockResolvedValue({ id_category: 1 });
    mockRepo.save.mockResolvedValue({ id_product: 10, ...productDto });
    mockRepo.findOne.mockResolvedValue({ id_product: 10, ...productDto });
    
    // Simulamos 2 pasos de flujo para cubrir el bucle for/map
    mockFlowsService.findByCategoryOrderBySequence.mockResolvedValue([
      { id_role: 1, sequence: 1, role: { id_area: 1 } },
      { id_role: 2, sequence: 2, role: { id_area: 2 } }
    ]);
    mockEmployeesService.findEmployeeWithLeastWorkload.mockResolvedValue({ id_employee: 5 });
    mockTasksService.createTask.mockResolvedValue({ id_task: 100 });

    // Act
    const result = await service.createProduct(productDto as any);

    // Assert
    expect(result).toBeDefined();
    expect(mockTasksService.createTask).toHaveBeenCalledTimes(2);
    expect(mockTasksService.assignEmployee).toHaveBeenCalled();
  });

  // ==========================================
  // CP04: updateProduct (Restricción de Producción RF16)
  // ==========================================
  it('updateProduct: ERROR - lanza BadRequest si ya está en producción', async () => {
    // Arrange
    mockRepo.preload.mockResolvedValue({ id_product: 1, id_state: 2 }); // Estado 2 = En producción

    // Act & Assert
    await expect(service.updateProduct(1, { name: 'Edit' } as any))
      .rejects.toThrow(BadRequestException);
  });

  it('updateProduct: ÉXITO - permite actualizar si está en estado 1', async () => {
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