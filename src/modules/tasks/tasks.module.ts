import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';

// Se eliminó la importación de 'AreasModule' y 'ProductsModule' ya que no se utilizan en la configuración del módulo

@Module({
  imports: [
    TypeOrmModule.forFeature([Task])
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService]
})
export class TasksModule {}