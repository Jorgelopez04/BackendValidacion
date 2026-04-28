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

      private mapToResponseDto(order: Order): OrderResponseDto {
          // Log de depuración para ver qué llega exactamente del servidor
          // console.log('Objeto recibido para mapear:', JSON.stringify(order, null, 2));

          return plainToInstance(OrderResponseDto, {
              ...order,
              // AJUSTE 1: Validamos que 'state' y 'customer' existan antes de acceder a 'name'
              state_name: order.state ? (order.state as any).name : 'Sin Estado',
              customer_name: order.customer ? (order.customer as any).name : 'Sin Cliente',
              
              // AJUSTE 2: Validación ultra-segura para productos
              products: (order.products || []).map(p => ({
                  ...p,
                  category_name: (p.category as any)?.name || 'N/A',
                  state_name: (p.state as any)?.name || 'N/A',
                  order_id: p.id_order
              }))
          }, { 
              excludeExtraneousValues: true,
              enableImplicitConversion: true // Ayuda con tipos numéricos/fechas
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

          return orders.map(ord => this.mapToResponseDto(ord));
      }

      async findById(id: number): Promise<OrderResponseDto> {
          const order = await this.orderRepository.findOne({
              where: { id_order: Number(id) }, // Aseguramos que sea número
              relations: ['state', 'customer', 'products', 'products.category', 'products.state'] 
          });

          if (!order) {
              throw new NotFoundException(`No se encontró la orden con ID ${id}`);
          }

          return this.mapToResponseDto(order);
      }

      async createOrder(orderDto: CreateOrderDto): Promise<OrderResponseDto> {
          // Validar cliente primero
          await this.customersService.findById(orderDto.id_customer);

          // AJUSTE 3: Normalización de fechas para evitar problemas de comparación
          if (orderDto.estimated_delivery_date) {
              const delivery = new Date(orderDto.estimated_delivery_date);
              const now = new Date();
              now.setHours(0,0,0,0);
              if (delivery < now) {
                  throw new BadRequestException('La fecha estimada no puede ser en el pasado.');
              }
          }

          const newOrder = this.orderRepository.create({ 
              ...orderDto, 
              id_state: 1 // Asegúrate que el ID 1 exista en tu tabla de estados
          });

          const savedOrder = await this.orderRepository.save(newOrder);

          // RECARGA COMPLETA: Esto es lo que evita el error 500
          return this.findById(savedOrder.id_order);
      }

      async updateOrder(id: number, updatedOrder: UpdateOrderDto): Promise<OrderResponseDto> {
          const order = await this.orderRepository.findOne({ 
              where: { id_order: id }
          });

          if (!order) {
              throw new NotFoundException(`No se encontró la orden con ID ${id}`);
          }

          // Actualización simple de campos
          if (updatedOrder.estimated_delivery_date) {
              order.estimated_delivery_date = updatedOrder.estimated_delivery_date;
          }

          await this.orderRepository.save(order);

          return this.findById(id);
      }
  }