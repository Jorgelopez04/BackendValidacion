import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<Repository<Category>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repo = module.get(getRepositoryToken(Category));
  });

  // 🔹 FIND ALL
  it('should return categories', async () => {
    repo.find.mockResolvedValue([{ id_category: 1 }] as any);

    const result = await service.findAll();
    expect(result).toBeDefined();
  });

  it('should throw if no categories', async () => {
    repo.find.mockResolvedValue([]);

    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  // 🔹 FIND BY ID
  it('should return category by id', async () => {
    repo.findOneBy.mockResolvedValue({ id_category: 1 } as any);

    const result = await service.findById(1);
    expect(result).toBeDefined();
  });

  it('should throw if category not found', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
  });

  // 🔹 CREATE
  it('should create category', async () => {
    repo.findOneBy.mockResolvedValue(null);
    repo.create.mockReturnValue({} as any);
    repo.save.mockResolvedValue({ id_category: 1 } as any);

    const result = await service.createCategory({ name: 'test' } as any);
    expect(result).toBeDefined();
  });

  it('should throw if category exists', async () => {
    repo.findOneBy.mockResolvedValue({ id_category: 1 } as any);

    await expect(
      service.createCategory({ name: 'test' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // 🔹 UPDATE
  it('should update category successfully', async () => {
    repo.preload.mockResolvedValue({ id_category: 1 } as any);
    repo.save.mockResolvedValue({ id_category: 1 } as any);

    const result = await service.updateCategory(1, { name: 'new' } as any);
    expect(result).toBeDefined();
  });

  it('should throw if category not found in update', async () => {
    repo.preload.mockResolvedValue(null as any);

    await expect(
      service.updateCategory(1, {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if duplicate name in update', async () => {
    repo.preload.mockResolvedValue({ id_category: 1 } as any);

    repo.findOneBy.mockResolvedValue({ id_category: 2 } as any);

    await expect(
      service.updateCategory(1, { name: 'duplicate' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // 🔹 DELETE
  it('should delete category', async () => {
    repo.findOneBy.mockResolvedValue({ id_category: 1 } as any);
    repo.remove.mockResolvedValue({} as any);

    const result = await service.deleteCategory(1);
    expect(result).toBeDefined();
  });

  it('should throw if category not found in delete', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.deleteCategory(1)).rejects.toThrow(NotFoundException);
  });
});