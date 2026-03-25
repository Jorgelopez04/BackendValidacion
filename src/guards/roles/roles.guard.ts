import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "src/common/decorators/roles/roles.decorator";
import { Employee } from "src/modules/employees/entities/employee.entity";

@Injectable()
export class RolesGuard implements CanActivate {

  // 1. Agregamos 'readonly' para cumplir con la regla de inmutabilidad
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest() as { user: Employee };

    // 2. Usamos Optional Chaining para una validación más limpia
    if (!user?.role?.name) {
      throw new ForbiddenException('No se pudo verificar el rol del usuario.');
    }

    // 3. Cambiamos .some() por .includes() como sugiere el scanner
    const hasRole = requiredRoles.includes(user.role.name);

    if (!hasRole) {
      throw new ForbiddenException(`No tienes permiso para acceder a este recurso. Tu rol es: ${user.role.name}`);
    }

    return true;
  }
}