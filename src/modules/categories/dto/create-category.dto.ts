import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  @IsString({ message: 'El nombre debe contener letras' })
  @MaxLength(50, {message: 'El nombre no puede ser de más de 50 caracteres'})
  name: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe contener letras' })
  @MaxLength(100, {message: 'La decripción no puede ser de más de 100 caracteres'})
  description: string;
}
