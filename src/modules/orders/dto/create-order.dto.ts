import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsDate, IsPositive } from 'class-validator';

export class CreateOrderDto {

  @IsInt({ message: 'El campo id_customer debe ser un número entero.' })
  @IsPositive({ message: 'El campo id_customer debe ser un número positivo.' })
  id_customer: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'El campo estimated_delivery_date debe ser una fecha válida (formato ISO: YYYY-MM-DD).' })
  estimated_delivery_date?: Date;

}