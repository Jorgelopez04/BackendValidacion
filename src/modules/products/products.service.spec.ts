import { ProductsService } from './products.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { of } from 'rxjs'; // Asegúrese de tener RxJS si sus servicios devuelven Observables

describe('ProductsService (unit) - assertions fixed', () => {
  let service: ProductsService;
  let fakeRepo: any;
  let fakeOrdersService: any;
  let fakeCategoriesService: any;
  let fakeFlowsService: any;
  let fakeTasksService: any;
  let fakeEmployeesService: any;

  beforeEach(() => {
    fakeRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn().mockImplementation((p) => Promise.resolve({ ...p, id_product: 1 })),
      preload: jest.fn().mockResolvedValue(undefined),
    };

    fakeOrdersService = { findById: jest.fn().mockResolvedValue({ id_order: 1 }) };
    fakeCategoriesService = { findById: jest.fn().mockResolvedValue({ id_category: 1, name: 'Cat' }) };
    fakeFlowsService = { findByCategoryOrderBySequence: jest.fn().mockResolvedValue([]) };
    fakeTasksService = {
      createTask: jest.fn().mockImplementation((td) => Promise.resolve({ ...td, id_task: 99 })),
      assignEmployee: jest.fn().mockImplementation((taskId, empId) => Promise.resolve({ id_task: taskId, id_employee: empId })),
    };
    fakeEmployeesService = { findEmployeeWithLeastWorkload: jest.fn().mockResolvedValue({ id_employee: 7 }) };

    service = new ProductsService(
      fakeRepo,
      fakeOrdersService,
      fakeCategoriesService,
      fakeFlowsService,
      fakeTasksService,
      fakeEmployeesService,
    );
  });

  it('findAll lanza NotFoundException cuando no hay productos', async () => {
    // Corregido: Ahora esperamos que RECHACE con NotFoundException
    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  it('findById lanza NotFoundException si no existe', async () => {
    // Corregido: Esperamos que RECHACE si no lo encuentra
    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });

  it('createProduct lanza BadRequestException si no hay flujos para la categoría', async () => {
    fakeFlowsService.findByCategoryOrderBySequence.mockResolvedValue([]);
    
    await expect(
      service.createProduct({ id_order: 1, id_category: 5, name: 'x', fabric: 'f' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('createProduct crea tareas y asigna empleados cuando hay flujos', async () => {
    // Mock de 2 flujos para que el contador de asignaciones llegue a 2
    fakeFlowsService.findByCategoryOrderBySequence.mockResolvedValue([
      { id_role: 3, id_category: 5, sequence: 1, role: { id_role: 3 } },
      { id_role: 4, id_category: 5, sequence: 2, role: { id_role: 4 } }
    ]);

    // Para que la relación final funcione
    fakeRepo.findOne.mockResolvedValue({ id_product: 1, name: 'n', id_category: 5 });

    const res = await service.createProduct({ id_order: 1, id_category: 5, name: 'n', fabric: 'f' } as any);
    
    // Verificamos que se llamó a assignEmployee 2 veces
    expect(fakeTasksService.assignEmployee).toHaveBeenCalledTimes(2);
    expect(res).toBeDefined();
  });

  it('updateProduct lanza NotFoundException si no existe', async () => {
    fakeRepo.preload.mockResolvedValue(undefined);
    await expect(service.updateProduct(1, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('updateProduct lanza BadRequestException si id_state != 1', async () => {
    // Simulamos un producto que ya no está en estado inicial (id_state: 2)
    fakeRepo.preload.mockResolvedValue({ id_state: 2 });
    await expect(service.updateProduct(1, {} as any)).rejects.toThrow(BadRequestException);
  });

  it('updateProduct guarda y retorna cuando es válido', async () => {
    fakeRepo.preload.mockResolvedValue({ id_state: 1, id_product: 1 });
    const res = await service.updateProduct(1, { name: 'editado' } as any);
    expect(res).toBeDefined();
    expect(fakeRepo.save).toHaveBeenCalled();
  });
});