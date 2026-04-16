import { Role } from "src/modules/roles/entities/role.entity";
import { Task } from "src/modules/tasks/entities/task.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum States {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ name: 'employees' })
export class Employee {
  @PrimaryGeneratedColumn({ name: 'id_employee' })
  id_employee!: number;

  @Column({ name: 'id_role' })
  id_role!: number;

  @Column({ unique: true })
  cc!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', default: States.ACTIVE })
  state: States = States.ACTIVE; // ✅ Inicializado para el test

  @ManyToOne(() => Role, (role) => role.employees)
  @JoinColumn({ name: 'id_role' })
  role!: Role;

  @OneToMany(() => Task, (task) => task.employee)
  tasks!: Task[] ; // 👈 CAMBIO CLAVE: Cambia !: por = [];
}