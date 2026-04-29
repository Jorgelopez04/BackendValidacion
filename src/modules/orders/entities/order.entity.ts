import { State } from "src/common/entities/state.entity";
import { Customer } from "src/modules/customers/entities/customer.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('orders')
export class Order {

  @PrimaryGeneratedColumn({ name: 'id_order' })
  id_order!: number;

  @Column({ name: 'id_state', default: 1 })
  id_state!: number;

  @Column({ name: 'id_customer' })
  id_customer!: number;

  @CreateDateColumn()
  entry_date!: Date;

  @Column({ name: 'estimated_delivery_date', type: 'timestamp', nullable: true })
  estimated_delivery_date?: Date;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'id_state' })
  state!: State;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'id_customer' })
  customer!: Customer;

  @OneToMany(() => Product, (product) => product.order)
  products!: Product[];

  // 🔥 CLAVE PARA PASAR LOS TESTS
  constructor() {
    this.products = [];
  }
}