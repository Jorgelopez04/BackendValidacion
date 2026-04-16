import { Flow } from "src/modules/flows/entities/flow.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'id_category' })
  id_category!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description?: string;

  // El "!" le dice a TypeScript: "Tranquilo, TypeORM se encargará de esto"
  @OneToMany(() => Flow, (flow) => flow.category)
  flows!: Flow[]; 

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[]; 
}