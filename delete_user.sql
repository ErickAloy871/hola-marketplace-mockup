-- Seleccionar la base de datos
USE marketplace_min;

-- Ver el usuario antes de eliminarlo
SELECT id, correo, nombre, apellido, cuentaVerificada 
FROM USUARIOS 
WHERE correo = 'facturacioelectronica517@gmail.com';

-- Eliminar relaciones de roles (usando una variable temporal)
DELETE FROM usuarios_roles 
WHERE usuarioId = (
    SELECT id FROM (
        SELECT id FROM USUARIOS WHERE correo = 'facturacioelectronica517@gmail.com'
    ) AS temp
);

-- Eliminar el usuario
DELETE FROM USUARIOS 
WHERE correo = 'facturacioelectronica517@gmail.com';

-- Verificar que se eliminó
SELECT COUNT(*) as usuario_eliminado 
FROM USUARIOS 
WHERE correo = 'facturacioelectronica517@gmail.com';
-- Debería retornar 0
