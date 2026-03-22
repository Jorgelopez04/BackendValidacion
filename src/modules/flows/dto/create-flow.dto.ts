import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateFlowDto{
    @IsNotEmpty({message: 'El id de la categoria es obligatorio'})
    @IsNumber({},{message: 'El id de la categoria debe ser un número'})
    id_category: number;

    @IsNotEmpty({message: 'El id del rol es obligatorio'})
    @IsNumber({},{message: 'El id del rol debe ser un número'})
    id_role: number;

    @IsNotEmpty({message: 'La secuencia es obligatoria obligatorio'})
    @IsNumber({},{message: 'La secuencia debe ser un número'})
    sequence: number;

}