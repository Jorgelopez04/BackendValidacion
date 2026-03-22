import { Order } from "src/modules/orders/entities/order.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('customers')
export class Customer {
  
  @PrimaryGeneratedColumn({ name: 'id_customer', type: 'integer' })
  id_customer: number;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true, nullable: false })
  name: string;

  @Column({ name: 'address', type: 'varchar', length: 100, nullable: true })
  address: string;

  @Column({ name: 'phone', type: 'varchar', length: 15, nullable: false })
  phone: string;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];
}
