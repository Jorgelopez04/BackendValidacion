import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeesService } from 'src/modules/employees/employees.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/loginDto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
    constructor(private employeesService: EmployeesService, private jwtService: JwtService){}

    async validateEmployee(loginDto: LoginDto): Promise<any>{
        const employee = await this.employeesService.findByCc(loginDto.cc);

        if(employee && await bcrypt.compare(loginDto.password, employee.password)){
            const {password, ...result} = employee;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto): Promise<LoginResponseDto>{
        const validatedEmployee = await this.validateEmployee(loginDto);
        if(!validatedEmployee){
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = {
            sub: validatedEmployee.id_employee,
            cc: validatedEmployee.cc,
            id_rol: validatedEmployee.role.id_role
        };

    
        const access_token =  this.jwtService.sign(payload);
        return new LoginResponseDto(access_token, validatedEmployee)
    }

}