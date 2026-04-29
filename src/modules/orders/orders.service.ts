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

    // 🔥 IMPORTANTE: ahora es público y con el nombre que esperan los tests
    public mapToDto(order: Order): OrderResponseDto {
        return plainToInstance(OrderResponseDto, {
            ...order,
            state_name: order?.state ? (order.state as any).name : undefined,
            customer_name: order?.customer ? (order.customer as any).name : undefined,

            products: order?.products?.map(p => ({
                ...p,
                category_name: (p.category as any)?.name,
                state_name: (p.state as any)?.name,
                order_id: p.id_order
            }))
        }, { 
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async findAll(): Promise<OrderResponseDto[]> {
        const orders = await this.orderRepository.find({ 
            relations: ['state', 'customer'], 
            order: { id_order: 'ASC' } 
        });

        if (!orders || orders.length === 0) {
            throw new NotFoundException('No hay pedidos creados');
        }

        return orders.map(ord => this.mapToDto(ord));
    }

    async findById(id: number): Promise<OrderResponseDto> {
        const order = await this.orderRepository.findOne({
            where: { id_order: Number(id) },
            relations: ['state', 'customer', 'products', 'products.category', 'products.state'] 
        });

        if (!order) {
            throw new NotFoundException(`No se encontró la orden con ID ${id}`);
        }

        return this.mapToDto(order);
    }

    async createOrder(orderDto: CreateOrderDto): Promise<OrderResponseDto> {
        // Validar cliente
        await this.customersService.findById(orderDto.id_customer);

        // ✅ Validación fecha futura
        if (orderDto.estimated_delivery_date) {
            const delivery = new Date(orderDto.estimated_delivery_date);
            const now = new Date();
            now.setHours(0,0,0,0);

            if (delivery < now) {
                throw new BadRequestException(
                    'La fecha estimada no puede ser en el pasado.'
                );
            }
        }

        const newOrder = this.orderRepository.create({ 
            ...orderDto, 
            id_state: 1
        });

        const savedOrder = await this.orderRepository.save(newOrder);

        return this.findById(savedOrder.id_order);
    }

    async updateOrder(id: number, updatedOrder: UpdateOrderDto): Promise<OrderResponseDto> {
        const order = await this.orderRepository.findOne({ 
            where: { id_order: id }
        });

        if (!order) {
            throw new NotFoundException(`No se encontró la orden con ID ${id}`);
        }

        // 🔥 VALIDACIÓN QUE TE FALTABA (clave para pasar el test)
        if (
            updatedOrder.estimated_delivery_date &&
            order.entry_date &&
            new Date(updatedOrder.estimated_delivery_date) < new Date(order.entry_date)
        ) {
            throw new BadRequestException(
                'La fecha de entrega no puede ser menor a la fecha de ingreso'
            );
        }

        if (updatedOrder.estimated_delivery_date) {
            order.estimated_delivery_date = updatedOrder.estimated_delivery_date;
        }

        await this.orderRepository.save(order);

        return this.findById(id);
    }
}