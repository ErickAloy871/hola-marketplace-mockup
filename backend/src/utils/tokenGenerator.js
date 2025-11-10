/**
 * Genera un código de verificación aleatorio de 6 dígitos
 * @returns string - Código de 6 dígitos (ejemplo: "123456")
 */
export function generarCodigoVerificacion() {
    // Genera un número aleatorio entre 100000 y 999999
    var codigo = Math.floor(100000 + Math.random() * 900000);
    return codigo.toString();
}
/**
 * Calcula la fecha de expiración sumando minutos a la fecha actual
 * @param minutos - Número de minutos hasta la expiración (por defecto 15)
 * @returns Date - Fecha de expiración
 */
export function calcularFechaExpiracion(minutos) {
    if (minutos === void 0) { minutos = 15; }
    var fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() + minutos);
    return fecha;
}
/**
 * Formatea una fecha de JavaScript al formato MySQL DATETIME
 * @param fecha - Objeto Date a formatear
 * @returns string - Fecha en formato 'YYYY-MM-DD HH:MM:SS'
 */
export function formatearFechaMySQL(fecha) {
    // Convierte la fecha a ISO string y ajusta el formato para MySQL
    return fecha.toISOString().slice(0, 19).replace('T', ' ');
}
/**
 * Verifica si un token ha expirado
 * @param fechaExpiracion - Fecha de expiración del token
 * @returns boolean - true si ha expirado, false si aún es válido
 */
export function tokenHaExpirado(fechaExpiracion) {
    var ahora = new Date();
    return ahora > fechaExpiracion;
}
/**
 * Genera un código alfanumérico de longitud variable (útil para otros tokens)
 * @param longitud - Longitud del código (por defecto 32)
 * @returns string - Código alfanumérico aleatorio
 */
export function generarTokenAlfanumerico(longitud) {
    if (longitud === void 0) { longitud = 32; }
    var caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var token = '';
    for (var i = 0; i < longitud; i++) {
        var indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        token += caracteres.charAt(indiceAleatorio);
    }
    return token;
}
