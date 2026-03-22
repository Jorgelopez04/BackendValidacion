import { Expose } from "class-transformer";

export class UpdateRoleResposeDto{
    
    @Expose()
    name: string;

    @Expose()
    description?: string;
    
}