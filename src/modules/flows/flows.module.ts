import { Module } from '@nestjs/common';
import { FlowsService } from './flows.service';
import { FlowsController } from './flows.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flow } from './entities/flow.entity';
import { CategoriesModule } from '../categories/categories.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Flow]), CategoriesModule, RolesModule],
  providers: [FlowsService],
  controllers: [FlowsController],
  exports: [FlowsService]
})
export class FlowsModule {}
