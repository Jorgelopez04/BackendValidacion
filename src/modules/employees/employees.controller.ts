import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeeResponseDto } from './dto/update-employee-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';

@Controller('employees')
export class EmployeesController {

    constructor(private readonly employessService: EmployeesService) { }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Get('all')
    async findAll(): Promise<BaseApplicationResponseDto<EmployeeResponseDto[]>> {
        const employees = await this.employessService.findAll();
        return {
            statusCode: 200,
            message: 'Trabajadores obtenidos correctamente',
            data: employees
        }
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<BaseApplicationResponseDto<EmployeeResponseDto>> {
        const employee = await this.employessService.findById(+id);
        return {
            statusCode: 200,
            message: 'Trabajador obtenido correctamente',
            data: employee
        }
    }

    @Get('cc/:cc')
    async findByCc(@Param('cc') cc: string): Promise<BaseApplicationResponseDto<EmployeeResponseDto>> {
        const employee = await this.employessService.findByCc(cc);
        return {
            statusCode: 200,
            message: 'Trabajador obtenido correctamente',
            data: employee
        }
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Post()
    async createEmployee(@Body() createEmployee: CreateEmployeeDto): Promise<BaseApplicationResponseDto<EmployeeResponseDto>> {
        const newEmployee = await this.employessService.createEmployee(createEmployee);
        return {
            statusCode: 201,
            message: 'Trabajador creado correctamente',
            data: newEmployee
        }
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Patch(':id')
    async updateEmployee(@Param('id') id: string, @Body() updateEmployee: UpdateEmployeeDto): Promise<BaseApplicationResponseDto<UpdateEmployeeResponseDto>> {
        const updatedEmployee = await this.employessService.updateEmployee(+id, updateEmployee);
        return {
            statusCode: 202,
            message: 'Trabajador actualizado correctamente',
            data: updatedEmployee
        }
    }
    
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    async deleteEmployee(@Param('id') id: string): Promise<BaseApplicationResponseDto<EmployeeResponseDto>> {
        const deletedEmployee = await this.employessService.deleteEmployee(+id);
        return {
            statusCode: 202,
            message: 'Trabajador eliminado correctamente',
            data: deletedEmployee
        }
    }


}
