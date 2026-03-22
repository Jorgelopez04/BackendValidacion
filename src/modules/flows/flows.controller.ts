import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FlowsService } from './flows.service';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { FlowResponseDto } from './dto/flow-response.dto';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';

@Controller('flows')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class FlowsController {

    constructor(private flowsService: FlowsService) { }

    @Get('all')
    async findAll(): Promise<BaseApplicationResponseDto<FlowResponseDto[]>> {
        const flows = await this.flowsService.findAll()
        return {
            statusCode: 200,
            message: 'Flujos obtenidos correctamente',
            data: flows
        }
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<BaseApplicationResponseDto<FlowResponseDto>> {
        const flow = await this.flowsService.findById(+id);
        return{
            statusCode: 200, 
            message: 'Flujo obtenido correctamente',
            data: flow
        }
    }

    @Post()
    async createFlow(@Body() newFlow: CreateFlowDto): Promise<BaseApplicationResponseDto<FlowResponseDto>>{
        const flow = await this.flowsService.createFlow(newFlow);
        return{
            statusCode: 201, 
            message: 'Flujo creado correctamente',
            data: flow
        }
    }

    @Patch(':id')
    async updateFlow(@Param('id') id: string, @Body() updatedFlow: UpdateFlowDto){
        const newFlow = await this.flowsService.updateFlow(+id, updatedFlow);
        return{
            statusCode: 202, 
            message: 'Rol actualizado correctamente',
            data: newFlow
        }
    }

    @Delete()
    async deleteFlow(): Promise<void>{
        return this.flowsService.deleteFlow()
    }
}
