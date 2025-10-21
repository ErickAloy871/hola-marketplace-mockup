-- Script para actualizar las imágenes con tus archivos locales
-- Ejecuta este script después de colocar tus imágenes en backend/uploads/

-- Ejemplo: Actualizar imágenes de auriculares
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/auriculares1.jpg' 
WHERE publicacionId = 'PUB-1' AND orden = 1;

UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/auriculares2.jpg' 
WHERE publicacionId = 'PUB-1' AND orden = 2;

-- Ejemplo: Actualizar imagen de mouse
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/mouse-inalambrico.jpg' 
WHERE publicacionId = 'PUB-2' AND orden = 1;

-- Ejemplo: Actualizar imagen de lámpara
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/lampara-led.jpg' 
WHERE publicacionId = 'PUB-3' AND orden = 1;

-- Para agregar nuevas imágenes a un producto existente:
INSERT INTO fotos_publicacion (publicacionId, urlFoto, orden) VALUES
('PUB-1', 'http://localhost:4000/uploads/auriculares3.jpg', 3),
('PUB-2', 'http://localhost:4000/uploads/mouse-inalambrico-2.jpg', 2);


