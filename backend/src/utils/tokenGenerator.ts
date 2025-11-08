/**
 * Genera un código de verificación aleatorio de 6 dígitos
 * @returns string - Código de 6 dígitos (ejemplo: "123456")
 */
export function generarCodigoVerificacion(): string {
    // Genera un número aleatorio entre 100000 y 999999
    const codigo = Math.floor(100000 + Math.random() * 900000);
    return codigo.toString();
  }
  
  /**
   * Calcula la fecha de expiración sumando minutos a la fecha actual
   * @param minutos - Número de minutos hasta la expiración (por defecto 15)
   * @returns Date - Fecha de expiración
   */
  export function calcularFechaExpiracion(minutos: number = 15): Date {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() + minutos);
    return fecha;
  }
  
  /**
   * Formatea una fecha de JavaScript al formato MySQL DATETIME
   * @param fecha - Objeto Date a formatear
   * @returns string - Fecha en formato 'YYYY-MM-DD HH:MM:SS'
   */
  export function formatearFechaMySQL(fecha: Date): string {
    // Convierte la fecha a ISO string y ajusta el formato para MySQL
    return fecha.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  /**
   * Verifica si un token ha expirado
   * @param fechaExpiracion - Fecha de expiración del token
   * @returns boolean - true si ha expirado, false si aún es válido
   */
  export function tokenHaExpirado(fechaExpiracion: Date): boolean {
    const ahora = new Date();
    return ahora > fechaExpiracion;
  }
  
  /**
   * Genera un código alfanumérico de longitud variable (útil para otros tokens)
   * @param longitud - Longitud del código (por defecto 32)
   * @returns string - Código alfanumérico aleatorio
   */
  export function generarTokenAlfanumerico(longitud: number = 32): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < longitud; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      token += caracteres.charAt(indiceAleatorio);
    }
    
    return token;
  }
  