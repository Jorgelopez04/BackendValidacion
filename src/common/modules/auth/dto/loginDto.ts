import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LoginDto {

    @IsNotEmpty({ message: 'La cédula es obligatoria' })
    @IsString()
    @MaxLength(20, { message: 'La cédula no puede ser de más de 20 caracteres' })
    cc: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    password: string;
}