import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity'; // Importa la entidad Product
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    // 💡 AQUÍ ESTÁ EL TRUCO: Tienes que pasar las dos entidades en el array
    TypeOrmModule.forFeature([Order, Product]), 
    CustomersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}