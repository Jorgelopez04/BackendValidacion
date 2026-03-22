import { Expose } from "class-transformer";

export class CustomerResponseDto {
    
    @Expose()
    id_customer: number;
    
    @Expose()
    name: string;
    
    @Expose()
    address?: string;
    
    @Expose()
    phone: string;

}