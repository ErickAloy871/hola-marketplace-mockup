export declare class GmailService {
    private gmail;
    constructor();
    enviarCodigoVerificacion(correo: string, codigo: string, nombre: string): Promise<boolean>;
}
