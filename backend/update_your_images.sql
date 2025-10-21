-- Script para actualizar la base de datos con TUS imágenes reales
-- Ejecuta este script en tu base de datos

-- Actualizar imagen principal de auriculares (PUB-1)
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/auriculares1.jpg' 
WHERE publicacionId = 'PUB-1' AND orden = 1;

-- Agregar segunda imagen de auriculares (PUB-1)
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/auriculares2.webp' 
WHERE publicacionId = 'PUB-1' AND orden = 2;

-- Si no existe la segunda imagen, la creamos
INSERT IGNORE INTO fotos_publicacion (publicacionId, urlFoto, orden) VALUES
('PUB-1', 'http://localhost:4000/uploads/auriculares2.webp', 2);

-- Actualizar imagen de mouse (PUB-2)
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/mouse1.webp' 
WHERE publicacionId = 'PUB-2' AND orden = 1;

-- Actualizar imagen de lámpara (PUB-3)
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/lampara1.jpg' 
WHERE publicacionId = 'PUB-3' AND orden = 1;

-- Verificar que se actualizaron correctamente
SELECT publicacionId, urlFoto, orden FROM fotos_publicacion ORDER BY publicacionId, orden;


