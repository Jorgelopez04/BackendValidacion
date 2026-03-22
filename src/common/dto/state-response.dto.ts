import { Expose } from "class-transformer";
import { StateName } from "../entities/state.entity"; 

export class StateResponseDto {
    
    @Expose()
    id_state: number;

    @Expose()
    name: StateName;
}