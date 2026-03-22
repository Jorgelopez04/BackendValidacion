import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(@InjectRepository(Customer)private readonly customerRepository: Repository<Customer>) {}

    async findAll(): Promise<CustomerResponseDto[]>{
        const customers = await this.customerRepository.find();

        if(!customers || customers.length === 0){
            throw new NotFoundException('No se encontraron clientes');
        }

        return customers.map(customer => plainToInstance(CustomerResponseDto, customer, {excludeExtraneousValues:true}))
    }

    async findById(id:number): Promise<CustomerResponseDto>{
        const customer = await this.customerRepository.findOneBy({id_customer: id});

        if(!customer){
            throw new NotFoundException('El cliente no existe');
        }

        return plainToInstance(CustomerResponseDto, customer, {excludeExtraneousValues: true})
    }

    async createCustomer(createCustomer: CreateCustomerDto): Promise<CustomerResponseDto>{
        const existingCustomerByName = await this.customerRepository.findOne({  where: { name: createCustomer.name } });
        
        if (existingCustomerByName) {
            throw new ConflictException(`El nombre de cliente '${createCustomer.name}' ya está registrado.`);
        }
       
        const newCustomer = this.customerRepository.create(createCustomer);
        const savedCustomer = await this.customerRepository.save(newCustomer);
   
        return plainToInstance(CustomerResponseDto, savedCustomer, { excludeExtraneousValues: true });
    }

    async updateCustomer(id_customer: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
        
        const customerToUpdate = await this.customerRepository.preload({id_customer: id_customer, ...updateCustomerDto});

        if (!customerToUpdate) {
            throw new NotFoundException(`Cliente con ID ${id_customer} no encontrado.`);
        }

        
        if (updateCustomerDto.name) {
            const existingCustomerByName = await this.customerRepository.findOne({where: { name: updateCustomerDto.name }});

            if (existingCustomerByName && existingCustomerByName.id_customer !== id_customer) {
                throw new ConflictException(`El nombre de cliente '${updateCustomerDto.name}' ya está registrado.`);
            }
        }

        const savedCustomer = await this.customerRepository.save(customerToUpdate);
        return plainToInstance(CustomerResponseDto, savedCustomer, { excludeExtraneousValues: true });
    }

}
