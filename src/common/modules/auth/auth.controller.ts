import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('login')
    async login(@Body() user: LoginDto): Promise <BaseApplicationResponseDto<LoginResponseDto>>{
        const authEmplooye = await this.authService.login(user)
        return {
            statusCode: 200, 
            message: 'Inicio de sesión exitoso',
            data: authEmplooye
        }
    }
}