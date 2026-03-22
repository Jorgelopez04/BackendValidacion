export class BaseApplicationResponseDto<T>{
    statusCode: number;
    message: string;
    data: T;
}