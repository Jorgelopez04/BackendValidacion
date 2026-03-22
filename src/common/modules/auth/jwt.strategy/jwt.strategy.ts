// En jwt.strategy.ts

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { EmployeesService } from "src/modules/employees/employees.service";
import { Employee } from "src/modules/employees/entities/employee.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        private configService: ConfigService,
        private readonly employeesService: EmployeesService 
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

  
    async validate(payload: any): Promise<Employee> {

        const employeeId = payload.sub; 
        const employee = await this.employeesService.findByIdWithRole(employeeId);

        if (!employee || employee.state === 'INACTIVE') {

            throw new UnauthorizedException('Credenciales inválidas o empleado inactivo');
        }
        return employee;
    }
}