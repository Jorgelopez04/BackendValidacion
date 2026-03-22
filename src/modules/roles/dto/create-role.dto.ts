import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe contener letras' })
  @MaxLength(50, {message: 'El nombre no puede ser de más de 50 caracteres'})
  name: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe contener letras' })
  @MaxLength(100, {message: 'La descripción no puede ser de más de 100 caracteres'})
  description: string;

  @IsNotEmpty({ message: 'El ID del área es obligatorio' })
  @IsNumber({}, { message: 'El ID del área debe ser un número' })
  id_area: number;
}