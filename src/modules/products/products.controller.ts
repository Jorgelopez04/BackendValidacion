import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';

@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) { }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async findAll(): Promise<BaseApplicationResponseDto<ProductResponseDto[]>> {
    const products = await this.productsService.findAll();
    return {
      statusCode: 200,
      message: 'Productos obtenidos correctamente',
      data: products
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'Esqueletería', 'Corte', 'Tapicero', 'Costurero', 'Pintor')
  async findById(@Param('id') id: string): Promise<BaseApplicationResponseDto<ProductResponseDto>> {
    const product = await this.productsService.findById(+id);
    return {
      statusCode: 200,
      message: 'Producto obtenido correctamente',
      data: product
    };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<BaseApplicationResponseDto<ProductResponseDto>> {
    const product = await this.productsService.createProduct(createProductDto);
    return {
      statusCode: 201,
      message: 'Producto creado exitosamente con flujo de trabajo asignado',
      data: product
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<BaseApplicationResponseDto<ProductResponseDto>> {
    const product = await this.productsService.updateProduct(+id, updateProductDto);
    return {
      statusCode: 200,
      message: 'Producto actualizado correctamente',
      data: product
    };
  }
}