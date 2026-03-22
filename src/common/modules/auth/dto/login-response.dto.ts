export class LoginResponseDto{
    id_rol: number;
    cc: string;
    access_token: string;

    constructor(accessToken, user){
        this.id_rol = user.id_rol;
        this.cc = user.cc;
        this.access_token = accessToken
    }
}