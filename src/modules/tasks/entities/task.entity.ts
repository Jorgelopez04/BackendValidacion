import {Column,Entity,PrimaryGeneratedColumn,Index,JoinColumn,ManyToOne,} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Area } from '../../areas/entities/area.entity';
import { State } from 'src/common/entities/state.entity';

@Entity('tasks')
@Index('uq_tasks_prod_seq', ['id_product', 'sequence'], { unique: true })
export class Task {
  @PrimaryGeneratedColumn({ name: 'id_task', type: 'integer' })
  id_task: number;

  @Column({ name: 'id_product', type: 'integer', nullable: false })
  id_product: number;

  @Column({ name: 'id_employee', type: 'integer', nullable: true })
  id_employee: number;

  @Column({ name: 'id_area', type: 'integer', nullable: false })
  id_area: number;

  @Column({ name: 'id_state', type: 'integer', nullable: false, default: 1 })
  id_state: number;

  @Column({ name: 'sequence', type: 'integer', nullable: false })
  sequence: number;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  start_date?: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  end_date?: Date;

  @ManyToOne(() => Product, (product) => product.tasks)
  @JoinColumn({ name: 'id_product' })
  product: Product;

  @ManyToOne(() => Employee, (employee) => employee.tasks, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_employee' })
  employee?: Employee;

  @ManyToOne(() => Area, (area) => area.tasks)
  @JoinColumn({ name: 'id_area' })
  area: Area;

  @ManyToOne(() => State, (state) => state.tasks)
  @JoinColumn({ name: 'id_state' })
  state: State;
}
