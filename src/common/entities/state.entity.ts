import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../../modules/orders/entities/order.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { Task } from '../../modules/tasks/entities/task.entity';

export enum StateName {
    PENDIENTE = 'PENDIENTE',
    EN_PROCESO = 'EN PROCESO',
    FINALIZADO = 'FINALIZADO',
    DEMORADO = 'DEMORADO',
}

@Entity('estados')
export class State {
    @PrimaryGeneratedColumn({ name: 'id_state', type: 'int' })
    id_state!: number;

    @Column({ 
        name: 'nombre', 
        type: 'varchar', 
        length: 20, 
        unique: true, 
        nullable: false 
    })
    nombre!: StateName;

    @OneToMany(() => Order, (order) => order.state)
    orders!: Order[];

    @OneToMany(() => Product, (product) => product.state)
    products!: Product[];

    @OneToMany(() => Task, (task) => task.state)
    tasks!: Task[];

    // ✅ Corregido: Constructor eliminado
}