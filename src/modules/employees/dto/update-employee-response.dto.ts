import { Expose } from "class-transformer";
import { States } from "../entities/employee.entity";

export class UpdateEmployeeResponseDto {
  @Expose()
  name: string;

  @Expose()
  cc: number;

  @Expose()
  state: States;
}