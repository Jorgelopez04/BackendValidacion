import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { AreaResponseDto } from './dto/area-respose.dto';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';

@Controller('areas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AreasController {
  // El uso de 'private readonly' es correcto para SonarQube
  constructor(private readonly areasService: AreasService) {}

  @Get('all')
  async findAll(): Promise<BaseApplicationResponseDto<AreaResponseDto[]>> {
    const areas = await this.areasService.findAll();
    return {
      statusCode: 200,
      message: 'Áreas obtenidas correctamente',
      data: areas
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<BaseApplicationResponseDto<AreaResponseDto>> {
    const area = await this.areasService.findById(+id);
    return {
      statusCode: 200,
      message: 'Área obtenida correctamente',
      data: area
    };
  }

  @Post()
  async createArea(@Body() createArea: CreateAreaDto): Promise<BaseApplicationResponseDto<AreaResponseDto>> {
    const newArea = await this.areasService.createArea(createArea);
    return {
      statusCode: 201,
      message: 'Área creada correctamente',
      data: newArea
    };
  }

  @Patch(':id')
  async updateArea(@Param('id') id: string, @Body() updateArea: CreateAreaDto): Promise<BaseApplicationResponseDto<AreaResponseDto>> {
    const updatedArea = await this.areasService.updateArea(+id, updateArea);
    return {
      statusCode: 202,
      message: 'Área actualizada correctamente',
      data: updatedArea
    };
  }

  @Delete(':id')
  async deleteArea(@Param('id') id: string): Promise<BaseApplicationResponseDto<AreaResponseDto>> {
    const deletedArea = await this.areasService.deleteArea(+id);
    return {
      statusCode: 202,
      message: 'Área eliminada correctamente',
      data: deletedArea
    };
  }
}