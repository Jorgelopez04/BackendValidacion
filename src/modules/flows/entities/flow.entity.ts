import { Category } from "src/modules/categories/entities/category.entity";
import { Role } from "src/modules/roles/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('flows')
@Unique(['id_category', 'sequence'])
export class Flow {

  @PrimaryGeneratedColumn({ name: 'id_flow', type: 'integer' })
  id_flow: number;

  @Column({ name: 'id_category', type: 'integer' })
  id_category: number;

  @Column({ name: 'id_role', type: 'integer' })
  id_role: number;

  @Column({ name: 'sequence', type: 'integer' })
  sequence: number;

  @ManyToOne(() => Role, (role) => role.flows)
  @JoinColumn({ name: 'id_role' })
  role: Role;

  @ManyToOne(() => Category, (category) => category.flows)
  @JoinColumn({ name: 'id_category' })
  category: Category;
}
