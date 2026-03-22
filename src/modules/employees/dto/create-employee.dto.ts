import {IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateEmployeeDto{

    @IsNotEmpty({message: 'El ID de rol es obligatorio'})
    @IsInt({message: 'El ID de rol debe ser un número'})
    id_role: number;
    
    @IsNotEmpty({message: 'La cédula es obligatoria'})
    @IsString()
    @MaxLength(20, {message: 'La cédula no puede ser de más de 20 caracteres'})
    cc: string;
    
    @IsNotEmpty({message: 'El nombre es obligatorio'})
    @IsString({message: 'El nombre debe contener letras'})
    @MaxLength(100, {message: 'El nombre no puede ser de más de 100 caracteres'})
    name: string;

    @IsNotEmpty({message: 'La contraseña es obligatoria'})
    @IsString({message: 'La contraseña debe contener letras'})
    @MaxLength(100, {message: 'La contraseña no puede ser de más de 100 caracteres'})
    password: string;

}