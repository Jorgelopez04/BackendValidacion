import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Not, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { RoleResponseDto } from './dto/role-response.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRoleResposeDto } from './dto/update-role-response.dto';

@Injectable()
export class RolesService {
    constructor(@InjectRepository(Role) private roleRepository: Repository<Role>){}

    async findAll(): Promise<RoleResponseDto[]>{
        const roles = await this.roleRepository.find({relations: ['area']})

        if(!roles || roles.length === 0){
            throw new NotFoundException('No se encontraron roles');
        }

        return roles.map(role => plainToInstance(RoleResponseDto, role, {excludeExtraneousValues: true}))
    }

    async findById(id:number): Promise<Role>{
        const role = await this.roleRepository.findOne({where: {id_role: id}, relations: ['area']});

        if(!role){
            throw new NotFoundException('Rol no encontrado');
        }
        return role;
    }

    async createRole(createRole: CreateRoleDto): Promise<RoleResponseDto>{
        const existingRole = await this.roleRepository.findOneBy({id_area: createRole.id_area,name: createRole.name});

        if(existingRole){
            throw new BadRequestException('El rol ya existe en el sistema para esa área');
        }

        const newRole = this.roleRepository.create(createRole);
        
        const savedRole = await this.roleRepository.save(newRole); 
        return plainToInstance(RoleResponseDto, savedRole, {excludeExtraneousValues: true})
    }

    async updateRole(id: number, updateRole: UpdateRoleDto): Promise<UpdateRoleResposeDto>{
        const existingRole = await this.roleRepository.preload({id_role: id, ...updateRole})

        if(!existingRole){
            throw new NotFoundException('El rol no existe en el sistema');
        }

        if(updateRole.name){
            const roleWithSameNameInArea = await this.roleRepository.findOneBy({id_area: existingRole.id_area, name: updateRole.name,id_role: Not(id)});

            if(roleWithSameNameInArea){
                throw new BadRequestException('El nuevo nombre del rol ya lo usa otro rol en esta área');
            }
        }
        
        const savedRole = await this.roleRepository.save(existingRole);
        return plainToInstance(UpdateRoleResposeDto, savedRole, {excludeExtraneousValues: true})
    }

    async deleteRole(id: number): Promise<RoleResponseDto>{
        const existingRole = await this.roleRepository.findOne({where: {id_role: id}, relations: ['employees']}, );

        if(!existingRole){
            throw new NotFoundException('El rol no existe en el sistema');
        }

        if(existingRole.employees.length > 0){
            throw new BadRequestException('No se puede eliminar el rol porque tiene empleados asociados')
        }

        await this.roleRepository.remove(existingRole);
        return plainToInstance(RoleResponseDto, existingRole, {excludeExtraneousValues: true})
    }

}
