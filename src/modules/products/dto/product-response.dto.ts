import { Expose, Transform } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  id_product: number;

  @Expose()
  name: string;

  @Expose()
  customized: number;

  @Expose()
  ref_photo?: string;

  @Expose()
  dimensions?: string;

  @Expose()
  fabric?: string;

  @Expose()
  description?: string;

  @Expose()
  category_name: string;

  @Expose()
  order_id: number;

  @Expose()
  state_name: string;

  @Expose()
  @Transform(({ obj }) => obj.customized === 1 ? 'Personalizado' : 'Estándar')
  customized_label: string;
}
