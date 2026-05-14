import { Category } from "src/modules/categories/entities/category.entity";
import { Order } from "src/modules/orders/entities/order.entity";
import { State } from "src/common/entities/state.entity";
import { Task } from "src/modules/tasks/entities/task.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ name: 'id_product' })
  id_product!: number;

  @Column()
  name!: string;

  // Agrega estas columnas explícitas para poder usarlas en los servicios
  @Column({ name: 'id_category' })
  id_category!: number;

  @Column({ name: 'id_state', default: 1 })
  id_state!: number;

  @Column({ name: 'id_order', nullable: true })
  id_order!: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'id_category' })
  category!: Category;

  @ManyToOne(() => Order, (order) => order.products)
  @JoinColumn({ name: 'id_order' })
  order!: Order;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'id_state' })
  state!: State;

  @OneToMany(() => Task, (task) => task.product)
  tasks!: Task[];
}