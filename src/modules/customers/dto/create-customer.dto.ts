import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
    
    @IsString({message: 'El nombre debe contener caracteres'})
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    @MaxLength(100, {message: 'El nombre puede tener máximo 100 caracteres'})
    name: string; 

    @IsOptional()
    @IsString({message: 'La dirección debe contener caracteres'})
    @MaxLength(100, {message: 'La dirección puede tener máximo 100 caracteres'})
    address?: string;

    @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
    @IsString({message: 'El telefono debe contener caracteres'})
    @MaxLength(15, {message: 'El téfono puede tener máximo 15 caracteres'})
    phone: string;
}