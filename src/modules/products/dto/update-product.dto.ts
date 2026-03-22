import { IsInt, IsOptional, IsString, IsPositive, MaxLength } from 'class-validator';

export class UpdateProductDto {
    
  @IsOptional()
  @IsInt({ message: 'El campo id_state debe ser un número entero.' })
  @IsPositive({ message: 'El campo id_state debe ser un número positivo.' })
  id_state: number;

  @IsOptional()
  @IsString({ message: 'El campo dimensions debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El campo dimensions no puede tener más de 100 caracteres.' })
  dimensions?: string;

  @IsOptional()
  @IsString({ message: 'El campo fabric debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'El campo fabric no puede tener más de 100 caracteres.' })
  fabric?: string;

  @IsOptional()
  @IsString({ message: 'El campo description debe ser una cadena de texto.' })
  @MaxLength(300, { message: 'El campo description no puede tener más de 300 caracteres.' })
  description?: string;
  
}
