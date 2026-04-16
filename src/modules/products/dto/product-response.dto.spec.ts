import { ProductResponseDto } from './product-response.dto';

describe('ProductResponseDto', () => {
  it('should create dto with values', () => {
    const dto = new ProductResponseDto();

    dto.id_product = 1;
    dto.name = 'Test Product';

    expect(dto).toBeDefined();
    expect(dto.id_product).toBe(1);
    expect(dto.name).toBe('Test Product');
  });

  it('should handle empty dto', () => {
    const dto = new ProductResponseDto();
    expect(dto).toBeDefined();
  });
});