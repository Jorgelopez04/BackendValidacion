import { Exclude, Expose, Type } from 'class-transformer';
import { ProductResponseDto } from 'src/modules/products/dto/product-response.dto';
import { EmployeeResponseDto } from 'src/modules/employees/dto/employee-response.dto';
import { AreaResponseDto } from 'src/modules/areas/dto/area-respose.dto';
import { StateResponseDto } from 'src/common/dto/state-response.dto';

@Exclude()
export class TaskResponseDto {
    @Expose()
    id_task: number;

    @Expose()
    id_product: number;

    @Expose()
    id_employee: number;

    @Expose()
    id_area: number;

    @Expose()
    id_state: number;

    @Expose()
    sequence: number;

    @Expose()
    start_date: Date;

    @Expose()
    end_date: Date;

    @Expose()
    @Type(() => ProductResponseDto)
    product?: ProductResponseDto;

    @Expose()
    @Type(() => EmployeeResponseDto)
    employee?: EmployeeResponseDto;

    @Expose()
    @Type(() => AreaResponseDto)
    area?: AreaResponseDto;

    @Expose()
    @Type(() => StateResponseDto)
    state?: StateResponseDto;

}