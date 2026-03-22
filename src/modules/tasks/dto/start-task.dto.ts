import { IsDateString, IsOptional } from 'class-validator';

export class StartTaskDto {
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD)' })
    @IsOptional()
    start_date?: Date;
}