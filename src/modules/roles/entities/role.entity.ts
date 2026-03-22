import { Area } from "src/modules/areas/entities/area.entity";
import { Employee } from "src/modules/employees/entities/employee.entity";
import { Flow } from "src/modules/flows/entities/flow.entity";
import {Column,Entity,JoinColumn,ManyToOne,OneToMany,PrimaryGeneratedColumn,Unique} from "typeorm";

@Entity({ name: 'roles' })
@Unique(['id_area', 'name'])
export class Role {
    
  @PrimaryGeneratedColumn({ name: 'id_role' })
  id_role: number;

  @Column({ name: 'id_area', type: 'int', nullable: true })
  id_area: number;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 100, nullable: true })
  description: string;

  @ManyToOne(() => Area, (area) => area.roles, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'id_area' })
  area: Area;

  @OneToMany(() => Employee, (emp) => emp.role)
  employees: Employee[];

  @OneToMany(() => Flow, (flow) => flow.role)
  flows: Flow[];
}
