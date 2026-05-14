import { Role } from "src/modules/roles/entities/role.entity"; // Ajusta la ruta según tu proyecto
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn({ name: 'id_area' })
  id_area!: number;

  @Column({ name: 'name', type: 'varchar', length: 50, unique: true })
  name!: string;

  // ✅ CORRECCIÓN: Se elimina la inicialización manual de la relación
  @OneToMany(() => Role, (role) => role.area)
  roles!: Role[];

  // 🗑️ Asegúrate de que NO haya un constructor inicializando "this.roles = []".
}