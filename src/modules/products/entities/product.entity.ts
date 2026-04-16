import { Category } from 'src/modules/categories/entities/category.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Task } from 'src/modules/tasks/entities/task.entity';
import { State } from 'src/common/entities/state.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ name: 'id_product' })
  id_product!: number;

  @Column({ name: 'id_category' })
  id_category!: number;

  @Column({ name: 'id_state', default: 1 })
  id_state!: number;

  @Column({ name: 'id_order', nullable: true }) // ✅ ARREGLA EL ERROR TS2339
  id_order?: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  ref_photo?: string;

  @Column({ nullable: true })
  fabric?: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'id_category' })
  category!: Category;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'id_state' })
  state!: State;

  @ManyToMany(() => Order, (order) => order.products)
  orders!: Order[]; // ✅ INICIALIZADO

  @OneToMany(() => Task, (task) => task.product)
  tasks: Task[] = []; // ✅ INICIALIZADO
}