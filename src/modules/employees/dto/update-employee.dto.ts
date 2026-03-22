import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { States } from "../entities/employee.entity";

export class UpdateEmployeeDto{

    @IsOptional()
    @IsString({ message: 'La contraseña debe contener letras o números válidos' })
    @MaxLength(100, {message: 'La contraseña no puede ser de más de 100 caracteres'})
    password?: string;
    
    @IsOptional()
    @IsEnum(States, { message: 'El estado debe ser ACTIVE o INACTIVE' })
    state?: States;
}