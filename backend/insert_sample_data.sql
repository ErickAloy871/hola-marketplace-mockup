-- Script para insertar datos de ejemplo con imágenes
-- Ejecutar este script después de crear las tablas

-- Insertar categorías si no existen
INSERT IGNORE INTO CATEGORIAS (id, nombre, descripcion) VALUES
(1, 'Electrónica', 'Dispositivos electrónicos y tecnología'),
(2, 'Hogar', 'Artículos para el hogar y decoración'),
(3, 'Ropa', 'Ropa y accesorios de moda');

-- Insertar publicaciones de ejemplo
INSERT IGNORE INTO PUBLICACIONES (id, nombre, descripcion, precio, ubicacion, categoriaId, disponibilidad, estado) VALUES
('PUB-1', 'Auriculares Bluetooth', 'Auriculares inalámbricos con micrófono y estuche de carga.', 29.99, 'Quito', 1, 1, 'PUBLICADA'),
('PUB-2', 'Mouse Inalámbrico', 'Mouse ergonómico con conexión 2.4G y batería recargable.', 14.50, 'Quito', 1, 1, 'PUBLICADA'),
('PUB-3', 'Lámpara LED', 'Lámpara de escritorio con luz ajustable.', 12.00, 'Guayaquil', 2, 1, 'PUBLICADA');

-- Insertar fotos de ejemplo usando URLs de placeholder.com
INSERT IGNORE INTO fotos_publicacion (publicacionId, urlFoto, orden) VALUES
-- Auriculares (3 imágenes)
('PUB-1', 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Auriculares+1', 1),
('PUB-1', 'https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Auriculares+2', 2),
('PUB-1', 'https://via.placeholder.com/400x300/059669/FFFFFF?text=Auriculares+3', 3),

-- Mouse (2 imágenes)
('PUB-2', 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Mouse+1', 1),
('PUB-2', 'https://via.placeholder.com/400x300/EA580C/FFFFFF?text=Mouse+2', 2),

-- Lámpara (1 imagen)
('PUB-3', 'https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Lámpara+LED', 1);


