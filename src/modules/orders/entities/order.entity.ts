import { State } from "src/common/entities/state.entity";
import { Customer } from "src/modules/customers/entities/customer.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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

  @ManyToMany(() => Product, (product) => product.orders)
  @JoinTable({
    name: 'order_products',
    joinColumn: { name: 'id_order', referencedColumnName: 'id_order' },
    inverseJoinColumn: { name: 'id_product', referencedColumnName: 'id_product' }
  })
  products: Product[] = []; // ✅ Corregido: Sin inicialización manual
}