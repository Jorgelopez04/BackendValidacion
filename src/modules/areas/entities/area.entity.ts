import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Task } from 'src/modules/tasks/entities/task.entity';

@Entity({ name: 'areas' })
export class Area {
  @PrimaryGeneratedColumn({ name: 'id_area' })
  id_area: number;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name: string;

  @OneToMany(() => Role, (role) => role.area)
  roles: Role[];

  @OneToMany(() => Task, (task) => task.area)
  tasks: Task[];
}
