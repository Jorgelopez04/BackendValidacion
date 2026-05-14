import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user/get-user.decorator';
import { TasksService } from './tasks.service';
import { Employee } from '../employees/entities/employee.entity';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { plainToInstance } from 'class-transformer';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {

    constructor(private readonly tasksService: TasksService) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'Esqueletería', 'Corte', 'Tapicero', 'Costurero', 'Pintor')
    async findAll(): Promise<BaseApplicationResponseDto<TaskResponseDto[]>> {
        const tasks = await this.tasksService.findAll();
        return {
            statusCode: 200,
            message: 'Tareas obtenidas correctamente',
            data: tasks
        };
    }

    @Get('assigned')
    @UseGuards(RolesGuard)
    @Roles('Esqueletería', 'Corte', 'Tapicero', 'Costurero', 'Pintor')
    async getAssignedTasks(@GetUser() user: Employee): Promise<BaseApplicationResponseDto<TaskResponseDto[]>> {
        const tasks = await this.tasksService.findAssignedTasks(user.id_employee);
        return {
            statusCode: 200,
            message: 'Tareas asignadas obtenidas correctamente',
            data: tasks
        };
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'Esqueletería', 'Corte', 'Tapicero', 'Costurero', 'Pintor')
    async findById(@Param('id') id: string): Promise<BaseApplicationResponseDto<TaskResponseDto>> {
        const task = await this.tasksService.findById(+id);
        return {
            statusCode: 200,
            message: 'Tarea obtenida correctamente',
            data: task
        };
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async createTask(@Body() createTaskDto: CreateTaskDto): Promise<BaseApplicationResponseDto<TaskResponseDto>> {
        const task = await this.tasksService.createTask(createTaskDto);
        return {
            statusCode: 201,
            message: 'Tarea creada correctamente',
            data: plainToInstance(TaskResponseDto, task, { excludeExtraneousValues: true })
        };
    }

    @Patch(':id/start')
    @UseGuards(RolesGuard)
    @Roles('Esqueletería', 'Corte', 'Tapicero', 'Costurero', 'Pintor')
    async startTask(@Param('id') idTask: string, @GetUser() user: Employee): Promise<BaseApplicationResponseDto<TaskResponseDto>> {
        const updatedTask = await this.tasksService.startTask(+idTask, user.id_employee);
        return {
            statusCode: 201,
            message: 'Tarea marcada como "En Proceso" y fecha de inicio registrada',
            data: updatedTask
        };
    }

    @Patch(':id/complete')
    @UseGuards(RolesGuard)
    @Roles('Esqueletería', 'Corte', 'Tapicero', 'Costurero', 'Pintor')
    async completeTask(@Param('id') idTask: string, @GetUser() user: Employee): Promise<BaseApplicationResponseDto<TaskResponseDto>> {
        const updatedTask = await this.tasksService.completeTask(+idTask, user.id_employee);
        return {
            statusCode: 201,
            message: 'Tarea completada exitosamente y fecha de fin registrada',
            data: updatedTask
        };
    }

    @Get(':id/product-tasks')
    @UseGuards(RolesGuard)
    @Roles('Esqueletería', 'Corte', 'Tapicero', 'Costurero', 'Pintor')
    async getProductTasks(@Param('id') id: string) {
        // Cambiamos getProductTask por findByProductId
        const tasks = await this.tasksService.findByProductId(+id); 
        return {
            statusCode: 200,
            message: 'Tareas mostradas correctamente',
            data: tasks
        }
    }
}
