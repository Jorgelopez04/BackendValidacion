import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,OneToMany} from 'typeorm';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { State } from 'src/common/entities/state.entity';
import { Task } from 'src/modules/tasks/entities/task.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ name: 'id_product', type: 'integer' })
  id_product: number;

  @Column({ name: 'id_order', type: 'integer', nullable: false })
  id_order: number;

  @Column({ name: 'id_category', type: 'integer', nullable: false })
  id_category: number;

  @Column({ name: 'id_state', type: 'integer', nullable: false, default: 1 })
  id_state: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'ref_photo', type: 'varchar', length: 255, nullable: true })
  ref_photo?: string;

  @Column({ name: 'dimensions', type: 'varchar', length: 100, nullable: true })
  dimensions?: string;

  @Column({ name: 'fabric', type: 'varchar', length: 100, nullable: true })
  fabric?: string;

  @Column({ name: 'description', type: 'varchar', length: 300, nullable: true })
  description?: string;

  @ManyToOne(() => Order, (order) => order.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_order' })
  order: Order;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_category' })
  category: Category;

  @ManyToOne(() => State, (state) => state.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_state' })
  state: State;

  @OneToMany(() => Task, (task) => task.product)
  tasks: Task[];
}
