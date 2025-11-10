export declare class EmailService {
    private transporter;
    constructor();
    /**
     * Envía un email con el código de verificación al usuario
     */
    enviarCodigoVerificacion(correo: string, codigo: string, nombre: string): Promise<boolean>;
    /**
     * Verifica que la configuración de SMTP esté correcta
     */
    verificarConfiguracion(): Promise<boolean>;
}
