import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EmployeesService } from '../../../../modules/employees/employees.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        // Se añade 'readonly' para eliminar el Issue de SonarQube
        private readonly configService: ConfigService,
        private readonly employeesService: EmployeesService 
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: any) {
        const id_employee = payload.sub;
        const employee = await this.employeesService.findByIdWithRole(id_employee);

       if (!employee || (employee.state as any) === 'INACTIVO' || (employee.state as any) === 2) {
    throw new UnauthorizedException('Credenciales inválidas o empleado inactivo');
}
        
        return employee;
    }
}