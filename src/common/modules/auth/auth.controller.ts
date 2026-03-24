import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { BaseApplicationResponseDto } from 'src/common/dto/base-application-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('autenticación')
export class AuthController {
    // Se añade 'readonly' para cumplir con la regla de mantenibilidad de SonarQube
    constructor(private readonly authService: AuthService) {}

    @Post('acceso')
    async login(@Body() usuario: LoginDto): Promise<BaseApplicationResponseDto<LoginResponseDto>> {
        const authorizedEmployee = await this.authService.login(usuario);
        
        return {
            statusCode: 200,
            message: 'Inicio de sesión exitoso',
            data: authorizedEmployee
        };
    }
}