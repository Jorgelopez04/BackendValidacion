import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateTaskStateDto {
    @IsInt({ message: 'El ID del estado debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID del estado es obligatorio' })
    id_state: number;
}