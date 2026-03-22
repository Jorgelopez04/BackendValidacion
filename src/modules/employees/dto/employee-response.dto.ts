import { Expose, Type } from "class-transformer";
import { RoleResponseDto } from "src/modules/roles/dto/role-response.dto";
import { TaskResponseDto } from "src/modules/tasks/dto/task-response.dto";

export class EmployeeResponseDto{

    @Expose()
    id_employee: number;
    
    @Expose()
    cc: string;

    @Expose()
    name: string;

    @Expose()
    state: string;
    
    @Expose()
    password: string;

    @Expose()
    @Type(() => RoleResponseDto) 
    role: RoleResponseDto;

    @Expose()
    @Type(() => TaskResponseDto)
    tasks: TaskResponseDto[]

}