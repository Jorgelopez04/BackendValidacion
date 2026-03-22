import { IsDateString, IsOptional } from 'class-validator';

export class CompleteTaskDto {
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD)' })
    @IsOptional()
    end_date?: Date;
}