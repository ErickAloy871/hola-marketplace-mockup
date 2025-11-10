import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Directorio donde se guardarán las imágenes
const uploadDir = './uploads/productos';

// Crear directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + random + extensión original
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro para validar tipo de archivo
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

// Exportar middleware configurado
export const uploadProductImages = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB por imagen
    files: 5 // Máximo 5 imágenes
  },
  fileFilter: fileFilter
}).array('images', 5); // 'images' coincide con form.append("images", f)
