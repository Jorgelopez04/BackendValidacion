import { Order } from "src/modules/orders/entities/order.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Task } from "src/modules/tasks/entities/task.entity";
import { Column, Entity, Generated, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum StateName {
    PENDING = 'PENDING',
    IN_PROCESS = 'IN PROCESS',
    FINISHED = 'FINISHED',
    DELAYED = 'DELAYED',
}

@Entity('states')
export class State {

    @PrimaryGeneratedColumn({ name: 'id_state', type: 'integer' })
    id_state: number;

    @Column({name: 'name',type: 'varchar',length: 20,  unique: true, nullable: false})
    name: StateName;

    @OneToMany(() => Order, (order) => order.state)
    orders: Order[];

    @OneToMany(() => Product, (product) => product.state)
    products: Product[];

    @OneToMany(() => Task, task => task.state)
    tasks: Task[];
}
