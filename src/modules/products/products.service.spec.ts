import { ProductsService } from './products.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductsService (unit) - assertions only', () => {
  let service: ProductsService;
  let fakeRepo: any;
  let fakeOrdersService: any;
  let fakeCategoriesService: any;
  let fakeFlowsService: any;
  let fakeTasksService: any;
  let fakeEmployeesService: any;

  beforeEach(() => {
    fakeRepo = {
      find: () => [],
      findOne: (opts?: any) => undefined,
      create: (dto: any) => ({ ...dto }),
      save: (p: any) => ({ ...p, id_product: 1 }),
      preload: (p: any) => undefined,
    };

    fakeOrdersService = { findById: (id: number) => ({ id_order: id }) };
    fakeCategoriesService = { findById: (id: number) => ({ id_category: id, name: 'Cat' }) };
    fakeFlowsService = { findByCategoryOrderBySequence: (id: number) => [] };
    fakeTasksService = {
      createTask: (td: any) => ({ ...td, id_task: 1 }),
      assignEmployee: (taskId: number, empId: number) => ({ id_task: taskId, id_employee: empId }),
    };
    fakeEmployeesService = { findEmployeeWithLeastWorkload: (roleId: number) => ({ id_employee: 2 }) };

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
    // repo.find devuelve [] por defecto -> debe rechazar con NotFoundException
    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  it('findById lanza NotFoundException si no existe', async () => {
    fakeRepo.findOne = (opts?: any) => undefined;
    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });

  it('createProduct lanza BadRequestException si no hay flujos para la categoría', async () => {
    fakeOrdersService.findById = (id: number) => ({ id_order: id });
    fakeCategoriesService.findById = (id: number) => ({ id_category: id, name: 'Cat' });
    fakeRepo.save = (p: any) => ({ ...p, id_product: 1, id_category: p.id_category || 5 });
    fakeFlowsService.findByCategoryOrderBySequence = (catId: number) => [];

    await expect(
      service.createProduct({ id_order: 1, id_category: 5, name: 'x', fabric: 'f' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('createProduct crea tareas y asigna empleados cuando hay flujos', async () => {
    fakeRepo.save = (p: any) => ({ ...p, id_product: 1, id_category: p.id_category || 5 });
    // ensure final findOne (productRelations) returns an object synchronously so plainToInstance works
    fakeRepo.findOne = (opts?: any) => ({ id_product: 1, name: 'n', id_category: 5 });

    fakeFlowsService.findByCategoryOrderBySequence = (catId: number) => [
      { id_role: 3, id_category: catId, sequence: 1, role: { id_area: 10, id_role: 3 } },
    ];

    let assignedCalls = 0;
    fakeTasksService.createTask = (td: any) => ({ ...td, id_task: 99 });
    fakeEmployeesService.findEmployeeWithLeastWorkload = (roleId: number) => ({ id_employee: 7 });
    fakeTasksService.assignEmployee = (taskId: number, empId: number) => {
      assignedCalls++;
      return { id_task: taskId, id_employee: empId };
    };

    const res = await service.createProduct({ id_order: 1, id_category: 5, name: 'n', fabric: 'f' } as any);
    // esperado: una asignación por cada flujo (aquí hay 1 flujo)
    expect(assignedCalls).toBe(1);
    expect(res).toBeDefined();
  });

  it('updateProduct lanza NotFoundException si no existe', async () => {
    fakeRepo.preload = (p: any) => undefined;
    await expect(service.updateProduct(1, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('updateProduct lanza BadRequestException si id_state != 1', async () => {
    fakeRepo.preload = (p: any) => ({ id_state: 2 });
    await expect(service.updateProduct(1, {} as any)).rejects.toThrow(BadRequestException);
  });

  it('updateProduct guarda y retorna cuando es válido', async () => {
    fakeRepo.preload = (p: any) => ({ id_state: 1, ...p });
    fakeRepo.save = (p: any) => ({ ...p, id_product: 1 });
    const res = await service.updateProduct(1, {} as any);
    expect(res).toBeDefined();
  });
});