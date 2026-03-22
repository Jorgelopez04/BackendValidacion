import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderResponseDto } from './dto/order-response.dto';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateOrderDto } from './dto/create-order.dto';
import { CustomersService } from '../customers/customers.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {

    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        private readonly customersService: CustomersService
    ) { }

    async findAll(): Promise<OrderResponseDto[]> {
        const orders = await this.orderRepository.find({ relations: ['state', 'customer'], order: { id_order: 'ASC' } })

        if (!orders || orders.length === 0) {
            throw new NotFoundException('No hay pedidos creados');
        }

        return orders.map(ord => plainToInstance(OrderResponseDto, { ...ord, state_name: ord.state.name, customer_name: ord.customer.name }, { excludeExtraneousValues: true }))
    }

    async findById(id: number): Promise<OrderResponseDto> {
        const order = await this.orderRepository.findOne({
            where: { id_order: id },
            relations: ['state', 'customer', 'products', 'products.category', 'products.state'] 
        });

        if (!order) {
            throw new NotFoundException(`No se encontró la orden con ID ${id}`);
        }

        return plainToInstance(OrderResponseDto, {
            ...order,
            state_name: order.state.name,
            customer_name: order.customer.name,
            products: order.products.map(p => ({
                ...p,
                category_name: p.category.name,
                state_name: p.state.name,
                order_id: p.id_order
            }))
        }, { excludeExtraneousValues: true });
    }

    async createOrder(order: CreateOrderDto): Promise<OrderResponseDto> {

        await this.customersService.findById(order.id_customer);

        if (order.estimated_delivery_date && new Date(order.estimated_delivery_date) < new Date()) {
            throw new BadRequestException('La fecha estimada no puede ser menor que la fecha actual.');
        }

        const newOrder = this.orderRepository.create({ ...order, id_state: 1, });

        const savedOrder = await this.orderRepository.save(newOrder);

        const completeOrder = await this.orderRepository.findOne({ where: { id_order: savedOrder.id_order }, relations: ['state', 'customer'] });

        return plainToInstance(OrderResponseDto, { ...completeOrder, state_name: completeOrder!.state.name, customer_name: completeOrder!.customer.name, }, { excludeExtraneousValues: true });
    }

    async updateOrder(id: number, updatedOrder: UpdateOrderDto): Promise<OrderResponseDto> {
        const order = await this.orderRepository.findOne({ where: { id_order: id }, relations: ['state', 'customer'], });

        if (!order) {
            throw new NotFoundException(`No se encontró la orden con ID ${id}`);
        }


        if (updatedOrder.estimated_delivery_date < order.entry_date) {
            throw new BadRequestException('La fecha estimada no puede ser menor que la fecha de ingreso.');

        }

        order.estimated_delivery_date = updatedOrder.estimated_delivery_date;

        const savedOrder = await this.orderRepository.save(order);

        return plainToInstance(OrderResponseDto, { ...savedOrder, state_name: savedOrder.state.name, customer_name: savedOrder.customer.name }, { excludeExtraneousValues: true });
    }

}
