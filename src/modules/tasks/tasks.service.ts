import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskResponseDto } from './dto/task-response.dto';
import { plainToInstance } from 'class-transformer';

export enum TaskState {
  PENDING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) 
    private readonly taskRepository: Repository<Task>, // ✅ Corregido: readonly
    private readonly dataSource: DataSource           // ✅ Corregido: readonly
  ) {}

  // ===============================
  // 🔍 QUERIES
  // ===============================

  async findAll(): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.find({
      relations: ['product', 'employee', 'area', 'state']
    });

    if (!tasks.length) {
      throw new NotFoundException('No existen tareas');
    }

    return tasks.map(this.toDto);
  }

  async findById(id: number): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({
      where: { id_task: id }
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return this.toDto(task);
  }

  async findAssignedTasks(employeeId: number): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.find({
      where: { id_employee: employeeId },
      relations: ['product'],
      order: { product: { id_product: 'ASC' } }
    });

    if (!tasks.length) return [];

    const enriched = await Promise.all(
      tasks.map(async (task) => {
        const prev = await this.findPreviousTask(
          task.id_product,
          task.sequence
        );

        return {
          ...task,
          previous_state: prev ? prev.id_state : null
        };
      })
    );

    return enriched.map(this.toDto);
  }

  // ===============================
  // 🏗️ CREACIÓN / ASIGNACIÓN
  // ===============================

  async createTask(taskData: {
    id_product: number;
    id_area: number;
    sequence: number;
    id_state: number;
  }): Promise<Task> {
    const exists = await this.taskRepository.findOne({
      where: {
        id_product: taskData.id_product,
        sequence: taskData.sequence
      }
    });

    if (exists) {
      throw new BadRequestException(
        `Ya existe una tarea con secuencia ${taskData.sequence}`
      );
    }

    const task = this.taskRepository.create(taskData);
    return this.taskRepository.save(task);
  }

  async assignEmployee(idTask: number, idEmployee: number): Promise<Task> {
    const task = await this.getTaskOrFail(idTask);

    if (task.id_employee) {
      throw new BadRequestException('La tarea ya tiene empleado');
    }

    task.id_employee = idEmployee;
    return this.taskRepository.save(task);
  }

  // ===============================
  // ⚙️ START / COMPLETE
  // ===============================

  async startTask(idTask: number, employeeId: number): Promise<TaskResponseDto> {
    const task = await this.getTaskOrFail(idTask);

    this.validateOwnership(task, employeeId);
    this.validateStartState(task);
    await this.ensurePreviousTaskCompleted(task);

    task.id_state = TaskState.IN_PROGRESS;
    task.start_date = new Date();

    const saved = await this.taskRepository.save(task);

    await this.updateCascadingStates(task);

    return this.toDto(saved);
  }

  async completeTask(idTask: number, employeeId: number): Promise<TaskResponseDto> {
    const task = await this.getTaskOrFail(idTask);

    this.validateOwnership(task, employeeId);
    this.validateCompleteState(task);

    task.id_state = TaskState.COMPLETED;
    task.end_date = new Date();

    const saved = await this.taskRepository.save(task);

    await this.updateCascadingStates(task);

    return this.toDto(saved);
  }

  // ===============================
  // 🔁 CASCADA
  // ===============================

  private async updateCascadingStates(task: Task): Promise<void> {
    await this.updateProductState(task.id_product);

    if (task.product?.id_order) {
      await this.updateOrderState(task.product.id_order);
    }
  }

  private async updateProductState(productId: number): Promise<void> {
    const tasks = await this.taskRepository.find({
      where: { id_product: productId }
    });

    if (!tasks.length) return;

    const newState = this.calculateState(
      tasks.map((t) => t.id_state)
    );

    await this.dataSource
      .createQueryBuilder()
      .update('products')
      .set({ id_state: newState })
      .where('id_product = :productId', { productId })
      .execute();
  }

  private async updateOrderState(orderId: number): Promise<void> {
    const products = await this.dataSource
      .createQueryBuilder()
      .select('p.id_state', 'id_state')
      .from('products', 'p')
      .where('p.id_order = :orderId', { orderId })
      .getRawMany();

    if (!products.length) return;

    const newState = this.calculateState(
      products.map((p) => p.id_state)
    );

    await this.dataSource
      .createQueryBuilder()
      .update('orders')
      .set({ id_state: newState })
      .where('id_order = :orderId', { orderId })
      .execute();
  }

  // ===============================
  // 🧠 HELPERS
  // ===============================

  private calculateState(states: number[]): number {
    // Si todos están completados, el estado general es COMPLETED
    if (states.every((s) => s === TaskState.COMPLETED)) return TaskState.COMPLETED;
    
    // ✅ Cambio: Utilizamos .includes() para una comparación más limpia y eficiente
    if (states.includes(TaskState.IN_PROGRESS) || states.includes(TaskState.COMPLETED)) {
        return TaskState.IN_PROGRESS;
    }
    
    return TaskState.PENDING;
    }

  private validateOwnership(task: Task, employeeId: number) {
    if (task.id_employee !== employeeId) {
      throw new ForbiddenException('No autorizado');
    }
  }

  private validateStartState(task: Task) {
    if (task.id_state === TaskState.IN_PROGRESS) {
      throw new ConflictException('La tarea ya está en proceso');
    }

    if (task.id_state !== TaskState.PENDING) {
      throw new BadRequestException('Estado inválido para iniciar');
    }
  }

  private validateCompleteState(task: Task) {
    if (task.id_state === TaskState.COMPLETED) {
      throw new ConflictException('Ya completada');
    }

    if (task.id_state !== TaskState.IN_PROGRESS) {
      throw new BadRequestException('Debe estar en proceso');
    }
  }

  private async ensurePreviousTaskCompleted(task: Task) {
    const prev = await this.findPreviousTask(task.id_product, task.sequence);

    if (prev && prev.id_state !== TaskState.COMPLETED) {
      throw new BadRequestException(
        'La tarea anterior no ha sido completada'
      );
    }
  }

  private async findPreviousTask(
    id_product: number,
    sequence: number
  ): Promise<Task | null> {
    if (sequence === 1) return null;

    return this.taskRepository.findOne({
      where: {
        id_product,
        sequence: sequence - 1
      }
    });
  }

  private getTaskOrFail(id: number): Promise<Task> {
    return this.taskRepository
      .findOne({
        where: { id_task: id },
        relations: ['product', 'product.order']
      })
      .then((task) => {
        if (!task) {
          throw new NotFoundException(`Tarea "${id}" no encontrada`);
        }
        return task;
      });
  }

  private toDto(task: Task): TaskResponseDto {
    return plainToInstance(TaskResponseDto, task, {
      excludeExtraneousValues: true
    });
  }

  // ===============================
  // 🧹 OTROS
  // ===============================

  async findByProductId(productId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { id_product: productId },
      relations: ['state']
    });
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.taskRepository.delete({ id_product: productId });
  }
  async findTasksByEmployee(employeeId: number) {
  return this.dataSource
    .createQueryBuilder()
    .select('task.id_task', 'id_task')
    .addSelect('product.name', 'product_name')
    .from('task', 'task')
    .getRawMany();
} 
  
}