import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find();

    if (!categories || categories.length === 0) {
      throw new NotFoundException('Aún no hay categorías registradas');
    }

    return categories.map(cat => plainToInstance(CategoryResponseDto, cat, { excludeExtraneousValues: true }));
  }

  async findById(id: number): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOneBy({ id_category: id });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return plainToInstance(CategoryResponseDto, category, { excludeExtraneousValues: true });
  }

  async createCategory(createCategory: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findOneBy({ name: createCategory.name });

    if (existing) {
      throw new BadRequestException('La categoría ya existe');
    }

    const newCategory = this.categoryRepository.create(createCategory);
    const saved = await this.categoryRepository.save(newCategory);

    return plainToInstance(CategoryResponseDto, saved, { excludeExtraneousValues: true });
  }

  async updateCategory(id: number, updateCategory: UpdateCategoryDto): Promise<CategoryResponseDto> {
        
    const category = await this.categoryRepository.preload({id_category: id,...updateCategory});

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if(updateCategory.name){
      const existingNameCategory = await this.categoryRepository.findOneBy({name: updateCategory.name,id_category: Not(id) });

      if(existingNameCategory) {
               
        throw new BadRequestException('Ya existe otra categoría con ese nombre');
      }
    }

    const saved = await this.categoryRepository.save(category);
    return plainToInstance(CategoryResponseDto, saved, { excludeExtraneousValues: true });
  }

  async deleteCategory(id: number): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findOneBy({ id_category: id });

    if (!existing) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.categoryRepository.remove(existing);

    return plainToInstance(CategoryResponseDto, existing, { excludeExtraneousValues: true });
  }
}
