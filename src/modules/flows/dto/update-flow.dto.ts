import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UpdateFlowDto{

    @IsOptional()
    @IsNotEmpty({message: 'El id del rol es obligatorio'})
    @IsNumber({},{message: 'El id del rol debe ser un número'})
    id_role?: number;

    @IsOptional()
    @IsNotEmpty({message: 'La secuencia es obligatoria obligatorio'})
    @IsNumber({},{message: 'La secuencia debe ser un número'})
    sequence?: number;
}