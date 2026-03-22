import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe contener letras' })
  @MaxLength(50, {message: 'El nombre no puede ser de más de 50 caracteres'})
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe contener letras' })
  @MaxLength(100, {message: 'La decripción no puede ser de más de 100 caracteres'})
  description?: string;
}
