import { Type } from "class-transformer";
import { IsDate, IsDateString } from "class-validator";

export class UpdateOrderDto{

    @Type(() => Date)
    @IsDate({ message: 'El campo estimated_delivery_date debe ser una fecha válida (formato ISO: YYYY-MM-DD).' })
    estimated_delivery_date: Date;

}