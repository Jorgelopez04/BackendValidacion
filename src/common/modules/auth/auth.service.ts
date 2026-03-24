import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeesService } from '../employees/employees.service';
import { LoginDto } from './dto/loginDto';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    // Se añade 'readonly' a ambos para que SonarQube no marque error de mantenibilidad
    constructor(
        private readonly employeesService: EmployeesService, 
        private readonly jwtService: JwtService
    ) {}

    async validateEmployee(login: LoginDto): Promise<any> {
        const employee = await this.employeesService.findByCc(login.cc);

        if (employee && await bcrypt.compare(login.password, employee.password)) {
            const { password, ...result } = employee;
            return result;
        }
        return null;
    }

    async login(login: LoginDto): Promise<LoginResponseDto> {
        const validatedEmployee = await this.validateEmployee(login);
        
        if (!validatedEmployee) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = {
            sub: validatedEmployee.id_employee,
            cc: validatedEmployee.cc,
            id_rol: validatedEmployee.role.id_rol
        };

        const accessToken = this.jwtService.sign(payload);
        
        // Retornamos el DTO con el token y los datos del empleado
        return new LoginResponseDto(accessToken, validatedEmployee);
    }
}