import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerDto {
    
    @IsOptional()
    @IsString({message: 'El nombre debe contener caracteres'})
    @MaxLength(100, {message: 'El nombre puede tener máximo 100 caracteres'})
    name?: string; 

    @IsOptional()
    @IsString({message: 'La dirección debe contener caracteres'})
    @MaxLength(100, {message: 'La dirección puede tener máximo 100 caracteres'})
    address?: string; 

    @IsOptional()
    @IsString({message: 'El telefono debe contener caracteres'}) 
    @MaxLength(15, {message: 'El téfono puede tener máximo 15 caracteres'})
    phone?: string; 
}