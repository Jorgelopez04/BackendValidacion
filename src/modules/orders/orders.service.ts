import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Order } from './entities/order.entity';
import { OrderResponseDto } from './dto/order-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    private readonly customersService: CustomersService,
  ) {}

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      relations: ['state', 'customer'],
      order: { id_order: 'ASC' },
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException('No hay pedidos creados');
    }

    return orders.map(ord => this.mapToDto(ord));
  }

  async findById(id: number): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id_order: id },
      relations: ['state', 'customer', 'products', 'products.category', 'products.state'],
    });

    if (!order) throw new NotFoundException(`No se encontró la orden con ID ${id}`);

    return this.mapToDto(order);
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    await this.customersService.findById(dto.id_customer);

    if (dto.estimated_delivery_date && new Date(dto.estimated_delivery_date) < new Date()) {
      throw new BadRequestException('La fecha estimada no puede ser menor que la fecha actual.');
    }

    const newOrder = this.orderRepository.create({ ...dto, id_state: 1 });
    const saved = await this.orderRepository.save(newOrder);

    // Reutilizamos findById para traer todas las relaciones y el formato correcto
    return this.findById(saved.id_order);
  }

  async updateOrder(id: number, dto: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id_order: id },
      relations: ['state', 'customer'],
    });

    if (!order) throw new NotFoundException(`No se encontró la orden con ID ${id}`);

    if (new Date(dto.estimated_delivery_date) < new Date(order.entry_date)) {
      throw new BadRequestException('La fecha estimada no puede ser menor que la de ingreso.');
    }

    order.estimated_delivery_date = dto.estimated_delivery_date;
    const saved = await this.orderRepository.save(order);

    return this.mapToDto(saved);
  }

  // Método privado para centralizar el mapeo y que el código sea más legible
  private mapToDto(order: any): OrderResponseDto {
    return plainToInstance(
      OrderResponseDto,
      {
        ...order,
        state_name: order.state?.name,
        customer_name: order.customer?.name,
        products: order.products?.map(p => ({
          ...p,
          category_name: p.category?.name,
          state_name: p.state?.name,
          order_id: p.id_order,
        })),
      },
      { excludeExtraneousValues: true },
    );
  }
}