import { Role } from "src/modules/roles/entities/role.entity";
import { Task } from "src/modules/tasks/entities/task.entity";
import {Column,Entity,JoinColumn,ManyToOne,Check,PrimaryGeneratedColumn,OneToMany,} from "typeorm";

export enum States {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Check(`"state" IN ('ACTIVE', 'INACTIVE')`)
@Entity({ name: 'employees' })
export class Employee {
  
  @PrimaryGeneratedColumn({ name: 'id_employee' })
  id_employee: number;

  @Column({ name: 'id_role' })
  id_role: number;

  @Column({ name: 'cc', type: 'varchar', length: 20, unique: true })
  cc: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({name: 'state',type: 'varchar',length: 20,default: States.ACTIVE})
  state: States;

  @ManyToOne(() => Role, (role) => role.employees, { nullable: false })
  @JoinColumn({ name: 'id_role' })
  role: Role;

  @OneToMany(() => Task, (task) => task.employee)
  tasks: Task[];
}
