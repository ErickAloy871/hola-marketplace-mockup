-- Script para diagnosticar y arreglar el usuario con problemas

-- 1. Ver el estado actual del usuario
SELECT 
    id,
    nombre,
    apellido,
    correo,
    cuentaVerificada,
    CASE 
        WHEN passwordHash IS NULL THEN 'NULL'
        WHEN passwordHash = '' THEN 'EMPTY'
        ELSE 'EXISTS'
    END as password_status,
    telefono,
    direccion
FROM USUARIOS 
WHERE correo = 'facturacioelectronica517@gmail.com';

-- 2. Ver si tiene roles asignados
SELECT u.id, u.correo, r.nombre as rol
FROM USUARIOS u
LEFT JOIN usuarios_roles ur ON u.id = ur.usuarioId
LEFT JOIN roles r ON ur.rolId = r.id
WHERE u.correo = 'facturacioelectronica517@gmail.com';

-- 3. SOLUCIÓN: Verificar la cuenta manualmente (si no está verificada)
UPDATE USUARIOS 
SET cuentaVerificada = 1 
WHERE correo = 'facturacioelectronica517@gmail.com' 
  AND cuentaVerificada = 0;

-- 4. Verificar que tenga el rol de COMPRADOR (si no lo tiene)
INSERT IGNORE INTO usuarios_roles (usuarioId, rolId)
SELECT id, 1 FROM USUARIOS 
WHERE correo = 'facturacioelectronica517@gmail.com'
  AND id NOT IN (SELECT usuarioId FROM usuarios_roles WHERE rolId = 1);

-- 5. Verificar nuevamente el estado
SELECT 
    u.id,
    u.correo,
    u.cuentaVerificada,
    GROUP_CONCAT(r.nombre) as roles
FROM USUARIOS u
LEFT JOIN usuarios_roles ur ON u.id = ur.usuarioId
LEFT JOIN roles r ON ur.rolId = r.id
WHERE u.correo = 'facturacioelectronica517@gmail.com'
GROUP BY u.id;
