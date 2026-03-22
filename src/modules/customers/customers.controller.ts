import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';

@Controller('customers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class CustomersController {

    constructor(private customersService: CustomersService) { }

    @Get('all')
    async findAll(): Promise<BaseApplicationResponseDto<CustomerResponseDto[]>> {
        const customers = await this.customersService.findAll();

        return {
            statusCode: 200,
            message: 'Clientes obtenidos correctamente',
            data: customers
        };
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<BaseApplicationResponseDto<CustomerResponseDto>> {
        const customer = await this.customersService.findById(+id)
        return {
            statusCode: 200,
            message: 'Cliente obtenido correctamente',
            data: customer
        };
    }

    @Post()
    async createCustomer(@Body() newCustomer: CreateCustomerDto): Promise<BaseApplicationResponseDto<CustomerResponseDto>> {
        const customer = await this.customersService.createCustomer(newCustomer);
        return {
            statusCode: 201,
            message: 'Cliente creado correctamente',
            data: customer
        };
    }

    @Patch(':id')
    async updateCustomer(@Param('id') id: string, @Body() updatedCustomer: UpdateCustomerDto): Promise<BaseApplicationResponseDto<CreateCustomerDto>> {
        const customer = await this.customersService.updateCustomer(+id, updatedCustomer);
        return {
            statusCode: 202,
            message: 'Cliente actualizado correctamente',
            data: customer
        };
    }

}
