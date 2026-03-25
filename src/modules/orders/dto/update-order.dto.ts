import { Type } from "class-transformer";
import { IsDate, IsNotEmpty } from "class-validator";

export class UpdateOrderDto {

    @Type(() => Date)
    @IsDate({ message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
    @IsNotEmpty({ message: 'La fecha de entrega es obligatoria' })
    estimated_delivery_date!: Date;

}