import { IsInt, IsNotEmpty, IsOptional, IsString, IsPositive, IsIn, MaxLength} from 'class-validator';

export class CreateProductDto {
  
  @IsInt({ message: 'El campo id_order debe ser un número entero.' })
  @IsPositive({ message: 'El campo id_order debe ser un número positivo.' })
  id_order: number;

  @IsInt({ message: 'El campo id_category debe ser un número entero.' })
  @IsPositive({ message: 'El campo id_category debe ser un número positivo.' })
  id_category: number;

  @IsString({ message: 'El campo name debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo name es obligatorio.' })
  @MaxLength(100, { message: 'El campo name no puede tener más de 100 caracteres.' })
  name: string;

  @IsOptional()
  @IsInt({ message: 'El campo customized debe ser un número entero (0 o 1).' })
  @IsIn([0, 1], { message: 'El campo customized solo puede ser 0 (no personalizado) o 1 (personalizado).' })
  customized?: number;

  @IsOptional()
  @IsString({ message: 'El campo ref_photo debe ser una cadena de texto.' })
  @MaxLength(255, { message: 'El campo ref_photo no puede tener más de 255 caracteres.' })
  ref_photo?: string;

  @IsOptional()
  @IsString({ message: 'El campo dimensions debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El campo dimensions no puede tener más de 100 caracteres.' })
  dimensions?: string;

  @IsNotEmpty({ message: 'El campo tela es obligatorio.' })
  @IsString({ message: 'El campo fabric debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El campo fabric no puede tener más de 100 caracteres.' })
  fabric: string;

  @IsOptional()
  @IsString({ message: 'El campo description debe ser una cadena de texto.' })
  @MaxLength(300, { message: 'El campo description no puede tener más de 300 caracteres.' })
  description?: string;

}
