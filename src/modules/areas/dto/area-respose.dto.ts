import { Expose, Type } from 'class-transformer';
import { RoleResponseDto } from 'src/modules/roles/dto/role-response.dto';

export class AreaResponseDto {
  @Expose()
  id_area: number;
  
  @Expose()
  name: string;
  
  @Expose()
  @Type(() => RoleResponseDto)
  roles?: RoleResponseDto[];
}