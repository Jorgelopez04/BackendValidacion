import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { Product } from './entities/product.entity';
import { ProductResponseDto } from './dto/product-response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { OrdersService } from '../orders/orders.service';
import { CategoriesService } from '../categories/categories.service';
import { FlowsService } from '../flows/flows.service';
import { TasksService } from '../tasks/tasks.service';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) 
    private readonly productRepository: Repository<Product>,
    private readonly ordersService: OrdersService,
    private readonly categoriesService: CategoriesService,
    private readonly flowsService: FlowsService,
    private readonly tasksService: TasksService,
    private readonly employeesService: EmployeesService,
  ) {}

  /**
   * CP01: Listar todos los productos
   */
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find();

    if (!products || products.length === 0) {
      throw new NotFoundException('No hay productos registrados');
    }

    return products.map(product => 
      plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true })
    );
  }

  /**
   * CP02: Buscar producto por ID (Reutilizable)
   */
  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ 
      where: { id_product: id }, 
      relations: ['order', 'category', 'state'] 
    });

    if (!product) {
      throw new NotFoundException(`El producto con ID ${id} no existe`);
    }

    return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true });
  }

  /**
   * CP03: Crear Producto y su Ruta de Producción
   */
  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    // 1. Validaciones de existencia (Caja Negra)
    await this.ordersService.findById(dto.id_order);
    const category = await this.categoriesService.findById(dto.id_category);

    // 2. Persistencia inicial del producto
    const newProduct = this.productRepository.create({ ...dto, id_state: 1 });
    const savedProduct = await this.productRepository.save(newProduct);

    // 3. Generación de la ruta de tareas (Caja Blanca - Lógica de Negocio)
    await this.initializeProductionRoute(savedProduct, category.name);

    // 4. Retorno con relaciones completas
    return this.findById(savedProduct.id_product);
  }

  /**
   * Lógica interna para generar tareas y asignar empleados según flujos
   */
  private async initializeProductionRoute(product: Product, categoryName: string): Promise<void> {
    const flows = await this.flowsService.findByCategoryOrderBySequence(product.id_category);

    if (!flows || flows.length === 0) {
      throw new BadRequestException(`No hay flujos configurados para la categoría ${categoryName}`);
    }

    for (const flow of flows) {
      // Crear la tarea para la secuencia actual
      const task = await this.tasksService.createTask({
        id_product: product.id_product,
        id_area: flow.role.id_area,
        sequence: flow.sequence,
        id_state: 1
      });

      // Asignar al empleado con menor carga de trabajo para ese rol
      const employee = await this.employeesService.findEmployeeWithLeastWorkload(flow.id_role);
      await this.tasksService.assignEmployee(task.id_task, employee.id_employee);
    }
  }

  /**
   * CP04: Actualizar Producto (Con validación de estado)
   */
  async updateProduct(id: number, updateDto: UpdateProductDto): Promise<ProductResponseDto> {
    // Usamos preload para verificar existencia y preparar el objeto
    const existingProduct = await this.productRepository.preload({ 
      id_product: id, 
      ...updateDto 
    });

    // Guarda 1: Existencia
    if (!existingProduct) {
      throw new NotFoundException('El producto no existe');
    }

    // Guarda 2: Regla de Negocio (Caja Blanca - Nodo de Decisión)
    if (existingProduct.id_state !== 1) {
      throw new BadRequestException('El producto ya está en producción, no se permiten cambios');
    }

    const savedProduct = await this.productRepository.save(existingProduct);
    return plainToInstance(ProductResponseDto, savedProduct, { excludeExtraneousValues: true });
  }
}