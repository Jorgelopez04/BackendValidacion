import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './modules/roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmployeesModule } from './modules/employees/employees.module';
import { AreasModule } from './modules/areas/areas.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FlowsModule } from './modules/flows/flows.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuthModule } from './common/modules/auth/auth.module';

@Module({
  imports: [
    RolesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Obtenemos el valor de SSL y lo forzamos a string para compararlo correctamente
        const sslValue = configService.get('DB_SSL')?.toString().toLowerCase();
        
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          // Solución: Si es 'true' (string o bool), activa SSL con el bypass de certificados
          ssl: sslValue === 'true' ? { rejectUnauthorized: false } : false,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
        };
      },
    }),
    EmployeesModule,
    AreasModule,
    CategoriesModule,
    FlowsModule,
    CustomersModule,
    OrdersModule,
    ProductsModule,
    TasksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}