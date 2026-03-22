import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';

@Controller('categories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('all')
  async findAll(): Promise<BaseApplicationResponseDto<CategoryResponseDto[]>> {
    const categories = await this.categoriesService.findAll();
    return { 
        statusCode: 200, 
        message: 'Categorías obtenidas correctamente', 
        data: categories
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<BaseApplicationResponseDto<CategoryResponseDto>> {
    const category = await this.categoriesService.findById(+id);
    return { 
        statusCode: 200, 
        message: 'Categoría obtenida correctamente', 
        data: category
    };
  }

  @Post()
  async createCategory(@Body() createDto: CreateCategoryDto): Promise<BaseApplicationResponseDto<CategoryResponseDto>> {
    const newCategory = await this.categoriesService.createCategory(createDto);
    return { 
        statusCode: 201, 
        message: 'Categoría creada correctamente', 
        data: newCategory 
    };
  }

  @Patch(':id')
  async updateCategory(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto): Promise<BaseApplicationResponseDto<CategoryResponseDto>> {
    const updatedCategory = await this.categoriesService.updateCategory(+id, updateDto);
    return { 
        statusCode: 202, 
        message: 'Categoría actualizada correctamente', 
        data: updatedCategory 
    };
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string): Promise<BaseApplicationResponseDto<CategoryResponseDto>> {
    const deletedCategory = await this.categoriesService.deleteCategory(+id);
    return { 
        statusCode: 202, 
        message: 'Categoría eliminada correctamente', 
        data: deletedCategory 
    };
  }
}
