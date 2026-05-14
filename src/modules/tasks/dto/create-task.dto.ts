import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class CreateTaskDto {
  @Type(() => Number)
  @IsInt({ message: 'El campo id_product debe ser un número entero.' })
  @IsPositive({ message: 'El campo id_product debe ser un número positivo.' })
  id_product!: number;

  @Type(() => Number)
  @IsInt({ message: 'El campo id_area debe ser un número entero.' })
  @IsPositive({ message: 'El campo id_area debe ser un número positivo.' })
  id_area!: number;

  @Type(() => Number)
  @IsInt({ message: 'El campo sequence debe ser un número entero.' })
  @IsPositive({ message: 'El campo sequence debe ser un número positivo.' })
  sequence!: number;

  @Type(() => Number)
  @IsInt({ message: 'El campo id_state debe ser un número entero.' })
  @IsPositive({ message: 'El campo id_state debe ser un número positivo.' })
  id_state!: number;
}
