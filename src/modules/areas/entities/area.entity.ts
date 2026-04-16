import { Role } from "src/modules/roles/entities/role.entity";
import { Task } from "src/modules/tasks/entities/task.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn({ name: 'id_area' })
  id_area!: number;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Role, (role) => role.area)
  roles: Role[]= []; // ✅ INICIALIZADO

  @OneToMany(() => Task, (task) => task.area)
  tasks: Task[] = [];

}