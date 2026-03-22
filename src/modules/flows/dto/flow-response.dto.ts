import { Expose, Type } from "class-transformer";
import { RoleResponseDto } from "src/modules/roles/dto/role-response.dto";
import { CategoryResponseDto } from "src/modules/categories/dto/category-response.dto";

export class FlowResponseDto {
  @Expose()
  id_flow: number;

  @Expose()
  sequence: number;

  @Expose()
  @Type(() => RoleResponseDto)
  role: RoleResponseDto;

  @Expose()
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto;
}