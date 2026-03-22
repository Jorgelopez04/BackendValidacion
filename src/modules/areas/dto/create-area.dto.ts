import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAreaDto {
  @IsNotEmpty({ message: 'El nombre del área es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena' })
  @MaxLength(100, {message: 'El nombre no puede ser de más de 100 caracteres'})
  name: string;
}