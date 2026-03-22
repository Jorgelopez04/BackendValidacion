// order-response.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
import { ProductResponseDto } from 'src/modules/products/dto/product-response.dto';

export class OrderResponseDto {
  @Expose()
  id_order: number;

  @Expose()
  state_name: string;

  @Expose()
  customer_name: string;

  @Expose()
  @Transform(({ value }) => value ? new Date(value).toISOString().split('T')[0] : null)
  entry_date: string;

  @Expose()
  @Transform(({ value }) => value ? new Date(value).toISOString().split('T')[0] : null)
  estimated_delivery_date?: string;

  @Expose()
  @Type(() => ProductResponseDto) 
  products?: ProductResponseDto[]; 
}