import { Expose } from 'class-transformer';

export class CategoryResponseDto {

  @Expose()
  id_category: number;
  
  @Expose()
  name: string;

  @Expose()
  description: string;
}
