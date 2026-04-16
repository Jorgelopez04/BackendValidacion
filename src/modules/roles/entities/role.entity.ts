import { Employee } from "src/modules/employees/entities/employee.entity";
import { Flow } from "src/modules/flows/entities/flow.entity";
import { Area } from "src/modules/areas/entities/area.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ name: 'id_role' })
  id_role!: number;

  @Column({ name: 'id_area' })
  id_area!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description?: string; 

  @ManyToOne(() => Area, (area) => area.roles)
  @JoinColumn({ name: 'id_area' })
  area!: Area;

  @OneToMany(() => Employee, (employee) => employee.role)
  employees: Employee[] = [];

  @OneToMany(() => Flow, (flow) => flow.role)
  flows: Flow[]= []; // ✅ INICIALIZADO

  // ❌ ELIMINA EL CONSTRUCTOR: Esto detona el error en Docker
}