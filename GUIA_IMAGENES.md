# 📸 Guía: Cómo Agregar Tus Propias Imágenes

## 🎯 **Proceso Completo (Paso a Paso)**

### **1. Preparar las Imágenes**
- Descarga o copia las imágenes que quieres usar
- Renómbralas con nombres descriptivos:
  - `auriculares1.jpg`
  - `auriculares2.jpg` 
  - `mouse-inalambrico.jpg`
  - `lampara-led.jpg`

### **2. Colocar en la Carpeta Correcta**
```
📁 backend/uploads/
├── 📸 auriculares1.jpg      ← Coloca tu imagen aquí
├── 📸 auriculares2.jpg      ← Coloca tu imagen aquí
├── 📸 mouse-inalambrico.jpg ← Coloca tu imagen aquí
├── 📸 lampara-led.jpg       ← Coloca tu imagen aquí
└── 📄 README.md
```

### **3. Actualizar la Base de Datos**

Ejecuta este SQL en tu base de datos:

```sql
-- Actualizar imagen principal de auriculares
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/auriculares1.jpg' 
WHERE publicacionId = 'PUB-1' AND orden = 1;

-- Actualizar imagen de mouse
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/mouse-inalambrico.jpg' 
WHERE publicacionId = 'PUB-2' AND orden = 1;

-- Actualizar imagen de lámpara
UPDATE fotos_publicacion 
SET urlFoto = 'http://localhost:4000/uploads/lampara-led.jpg' 
WHERE publicacionId = 'PUB-3' AND orden = 1;
```

### **4. Verificar que Funciona**

1. **Reinicia el backend** (si no está corriendo):
   ```bash
   cd backend
   npm run dev
   ```

2. **Prueba las URLs directamente**:
   - http://localhost:4000/uploads/auriculares1.jpg
   - http://localhost:4000/uploads/mouse-inalambrico.jpg
   - http://localhost:4000/uploads/lampara-led.jpg

3. **Verifica en el marketplace**: Las imágenes deberían aparecer en los productos

## 🔧 **Formato de Imágenes Recomendado**

- **Formatos**: JPG, PNG, WebP
- **Tamaño**: 400x300 píxeles (o similar)
- **Peso**: Menos de 1MB por imagen
- **Nombres**: Sin espacios, usar guiones o guiones bajos

## 📝 **Ejemplos de Nombres de Archivo**

✅ **Buenos nombres:**
- `auriculares-bluetooth.jpg`
- `mouse_inalambrico.jpg`
- `lampara-led-desk.jpg`

❌ **Nombres a evitar:**
- `auriculares bluetooth.jpg` (espacios)
- `Mouse Inalámbrico.jpg` (mayúsculas y espacios)
- `imagen1.jpg` (no descriptivo)

## 🚀 **Para Múltiples Imágenes por Producto**

```sql
-- Agregar segunda imagen a auriculares
INSERT INTO fotos_publicacion (publicacionId, urlFoto, orden) VALUES
('PUB-1', 'http://localhost:4000/uploads/auriculares2.jpg', 2);

-- Agregar tercera imagen
INSERT INTO fotos_publicacion (publicacionId, urlFoto, orden) VALUES
('PUB-1', 'http://localhost:4000/uploads/auriculares3.jpg', 3);
```

## 🆘 **Solución de Problemas**

**❌ Imagen no aparece:**
1. Verifica que el archivo esté en `backend/uploads/`
2. Verifica que el backend esté corriendo en puerto 4000
3. Prueba la URL directamente en el navegador
4. Verifica que la base de datos tenga la URL correcta

**❌ Error 404:**
- El archivo no existe en la carpeta uploads
- El nombre del archivo no coincide exactamente

**❌ Imagen se ve rota:**
- El archivo está corrupto
- El formato no es compatible
- El archivo es muy grande

## 📱 **Para Producción**

Cuando subas a producción:
1. Cambia `localhost:4000` por tu dominio real
2. Usa un CDN para mejor rendimiento
3. Optimiza las imágenes para web
4. Considera usar formatos modernos como WebP


