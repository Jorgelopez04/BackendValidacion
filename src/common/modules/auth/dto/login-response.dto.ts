export class LoginResponseDto{
    id_rol: number;
    cc: string;
    access_token: string;

    constructor(accessToken: string, user: any){
        // user es EmployeeResponseDto: no tiene id_rol directo, el rol está en user.role.id_role
        this.id_rol = user.role?.id_role ?? 0;
        this.cc = user.cc;
        this.access_token = accessToken;

        console.log('[LoginResponseDto] id_rol resuelto:', this.id_rol); // debe ser 1 o 2
    }
}