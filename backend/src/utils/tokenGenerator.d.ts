/**
 * Genera un código de verificación aleatorio de 6 dígitos
 * @returns string - Código de 6 dígitos (ejemplo: "123456")
 */
export declare function generarCodigoVerificacion(): string;
/**
 * Calcula la fecha de expiración sumando minutos a la fecha actual
 * @param minutos - Número de minutos hasta la expiración (por defecto 15)
 * @returns Date - Fecha de expiración
 */
export declare function calcularFechaExpiracion(minutos?: number): Date;
/**
 * Formatea una fecha de JavaScript al formato MySQL DATETIME
 * @param fecha - Objeto Date a formatear
 * @returns string - Fecha en formato 'YYYY-MM-DD HH:MM:SS'
 */
export declare function formatearFechaMySQL(fecha: Date): string;
/**
 * Verifica si un token ha expirado
 * @param fechaExpiracion - Fecha de expiración del token
 * @returns boolean - true si ha expirado, false si aún es válido
 */
export declare function tokenHaExpirado(fechaExpiracion: Date): boolean;
/**
 * Genera un código alfanumérico de longitud variable (útil para otros tokens)
 * @param longitud - Longitud del código (por defecto 32)
 * @returns string - Código alfanumérico aleatorio
 */
export declare function generarTokenAlfanumerico(longitud?: number): string;
