import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flow } from './entities/flow.entity';
import { Repository } from 'typeorm';
import { FlowResponseDto } from './dto/flow-response.dto';
import { plainToInstance } from 'class-transformer';
import { RolesService } from '../roles/roles.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';

@Injectable()
export class FlowsService {
    constructor(
        @InjectRepository(Flow) private flowRepository: Repository<Flow>,
        private readonly roleService: RolesService,
        private readonly categoriesService: CategoriesService
    ) { }

    async findAll(): Promise<FlowResponseDto[]> {
        const flows = await this.flowRepository.find({ relations: ['role', 'category', 'role.area'] });

        if (!flows || flows.length === 0) {
            throw new NotFoundException('No se encontraron flujos');
        }

        return flows.map(flow => plainToInstance(FlowResponseDto, flow, { excludeExtraneousValues: true }))
    }

    async findById(id: number): Promise<FlowResponseDto> {
        const flow = await this.flowRepository.findOne({ where: { id_flow: id }, relations: ['role', 'category'] });

        if (!flow) {
            throw new NotFoundException('El  flujo no existe');
        }

        return plainToInstance(FlowResponseDto, flow, { excludeExtraneousValues: true })
    }

    async createFlow(createFlow: CreateFlowDto): Promise<FlowResponseDto> {

        const existingRole = await this.roleService.findById(createFlow.id_role);

        if (!existingRole) {
            throw new NotFoundException('El rol ingresado no existe');
        }

        const existingCateory = await this.categoriesService.findById(createFlow.id_category);

        if (!existingCateory) {
            throw new NotFoundException('La categoría ingresada no existe');
        }

        const duplicateRole = await this.flowRepository.findOne({
            where: { id_category: createFlow.id_category, id_role: createFlow.id_role },
        });

        if (duplicateRole) {
            throw new BadRequestException(
                `El rol ${createFlow.id_role} ya está asignado al flujo de la categoría ${createFlow.id_category}`,
            );
        }

        const duplicateSequence = await this.flowRepository.findOne({
            where: { id_category: createFlow.id_category, sequence: createFlow.sequence },
        });

        if (duplicateSequence) {
            throw new BadRequestException(
                `Ya existe un flujo con la secuencia ${createFlow.sequence} en la categoría ${createFlow.id_category}`,
            );
        }


        const newFlow = this.flowRepository.create(createFlow);
        const savedFlow = await this.flowRepository.save(newFlow);
        return plainToInstance(FlowResponseDto, savedFlow)
    }

    async updateFlow(id: number, updateFlow: UpdateFlowDto): Promise<FlowResponseDto> {

    const existingFlow = await this.flowRepository.findOne({where: { id_flow: id },});

    if (!existingFlow) {
        throw new NotFoundException('El flujo no existe');
    }

    if (updateFlow.id_role && updateFlow.id_role !== existingFlow.id_role) {
        const existingRole = await this.roleService.findById(updateFlow.id_role);
        if (!existingRole) {
            throw new NotFoundException('El rol ingresado no existe');
        }

        const duplicateRole = await this.flowRepository.findOne({where: { id_category: existingFlow.id_category, id_role: updateFlow.id_role },});

        if (duplicateRole) {
            throw new BadRequestException(
                `El rol ${updateFlow.id_role} ya está asignado al flujo de la categoría ${existingFlow.id_category}`,
            );
        }

        existingFlow.id_role = updateFlow.id_role;
    }

  
    if (updateFlow.sequence && updateFlow.sequence !== existingFlow.sequence) {

        const duplicateSequence = await this.flowRepository.findOne({where: { id_category: existingFlow.id_category, sequence: updateFlow.sequence },});

        if (duplicateSequence) {
            throw new BadRequestException(`Ya existe un flujo con la secuencia ${updateFlow.sequence} en la categoría ${existingFlow.id_category}`);
        }

        existingFlow.sequence = updateFlow.sequence;
    }

    const updatedFlow = await this.flowRepository.save(existingFlow);
    return plainToInstance(FlowResponseDto, updatedFlow, { excludeExtraneousValues: true });
}


    async deleteFlow(): Promise<void> {
        throw new BadRequestException('Los flujos no pueden eliminarse una vez creados');
    }

    async findByCategoryOrderBySequence(idCategory: number): Promise<Flow[]>{
        return await this.flowRepository.find({where: {id_category: idCategory}, relations: ['role', 'role.area'], order: {sequence: 'ASC'}})
    }
}
