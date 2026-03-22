import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Flow } from 'src/modules/flows/entities/flow.entity';
import { Product } from 'src/modules/products/entities/product.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn({ name: 'id_category', type: 'integer' })
  id_category: number;

  @Column({ name: 'name', type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 100, nullable: true })
  description: string;

  @OneToMany(() => Flow, (flow) => flow.category)
  flows: Flow[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
