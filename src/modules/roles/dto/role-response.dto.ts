import { Expose, Type } from "class-transformer";
import { AreaResponseDto } from "src/modules/areas/dto/area-respose.dto";

export class RoleResponseDto {

  @Expose()
  id_role: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => AreaResponseDto)
  area?: AreaResponseDto;
}