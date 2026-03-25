import { Type } from "class-transformer";
import { IsDate } from "class-validator";

export class UpdateProductDto {

    // 1. Mantener @Type es fundamental para la transformación de string a objeto Date
    @Type(() => Date)
    // 2. Usar solo @IsDate es más limpio una vez que @Type ha hecho su trabajo
    @IsDate({ message: 'El campo estimated_delivery_date debe ser una fecha válida (formato ISO: YYYY-MM-DD).' })
    estimated_delivery_date: Date;

}