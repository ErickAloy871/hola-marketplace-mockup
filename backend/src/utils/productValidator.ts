// Lista de palabras prohibidas (puedes ampliarla)
const PALABRAS_PROHIBIDAS = [
    'porno', 'xxx', 'sex', 'sexo', 'adulto', 'desnudo',
    'droga', 'marihuana', 'cocaina', 'heroina', 'meta',
    'arma', 'pistola', 'rifle', 'escopeta', 'explosivo', 'bomba',
    'pirámide', 'multinivel', 'mlm', 'herbalife',
    'réplica', 'copia', 'pirata', 'falso', 'imitación',
    'hackear', 'crack', 'robar', 'estafa',
    'órgano', 'sangre', 'plasma',
  ];
  
  const PALABRAS_SOSPECHOSAS = [
    'gratis', 'regalo', 'gana dinero', 'millonario', 'urgente',
    'oportunidad única', 'sin inversión', 'trabajo desde casa',
  ];
  
  interface ValidationResult {
    isValid: boolean;
    score: number;
    reasons: string[];
    autoReject: boolean;
  }
  
  export function validateProduct(
    nombre: string,
    descripcion: string,
    precio: number,
    hasImages: boolean
  ): ValidationResult {
    let score = 100;
    const reasons: string[] = [];
    let autoReject = false;
  
    const nombreLower = nombre.toLowerCase().trim();
    const descripcionLower = (descripcion || '').toLowerCase().trim();
    const textoCompleto = `${nombreLower} ${descripcionLower}`;
  
    for (const palabra of PALABRAS_PROHIBIDAS) {
      if (textoCompleto.includes(palabra)) {
        score -= 50;
        reasons.push(`Contiene palabra prohibida: "${palabra}"`);
        autoReject = true;
      }
    }
  
    for (const palabra of PALABRAS_SOSPECHOSAS) {
      if (textoCompleto.includes(palabra)) {
        score -= 10;
        reasons.push(`Contiene palabra sospechosa: "${palabra}"`);
      }
    }
  
    if (precio <= 0) {
      score -= 25;
      reasons.push('Precio inválido (menor o igual a 0)');
      autoReject = true;
    } else if (precio < 1) {
      score -= 15;
      reasons.push('Precio sospechosamente bajo (< $1)');
    } else if (precio > 50000) {
      score -= 10;
      reasons.push('Precio extremadamente alto (> $50,000)');
    }
  
    if (!descripcion || descripcion.trim().length < 10) {
      score -= 20;
      reasons.push('Descripción muy corta (menos de 10 caracteres)');
    } else if (descripcion.trim().length < 30) {
      score -= 10;
      reasons.push('Descripción corta (menos de 30 caracteres)');
    }
  
    const mayusculas = descripcion.replace(/[^A-Z]/g, '').length;
    const totalLetras = descripcion.replace(/[^A-Za-z]/g, '').length;
    if (totalLetras > 0 && (mayusculas / totalLetras) > 0.7) {
      score -= 15;
      reasons.push('Texto con demasiadas MAYÚSCULAS');
    }
  
    const soloEspeciales = /^[^a-zA-Z0-9\s]+$/.test(descripcion.trim());
    if (soloEspeciales) {
      score -= 20;
      reasons.push('Descripción contiene solo caracteres especiales');
    }
  
    const urlPattern = /(https?:\/\/|www\.)/gi;
    if (urlPattern.test(textoCompleto)) {
      score -= 15;
      reasons.push('Contiene enlaces externos');
    }
  
    if (!nombre || nombre.trim().length < 3) {
      score -= 20;
      reasons.push('Nombre del producto muy corto');
      autoReject = true;
    } else if (nombre.trim().length > 100) {
      score -= 10;
      reasons.push('Nombre del producto muy largo');
    }
  
    if (!hasImages) {
      score -= 20;
      reasons.push('Publicación sin imágenes');
    }
  
    score = Math.max(0, score); 
  
    const isValid = score >= 40; 
  
    return {
      isValid,
      score,
      reasons,
      autoReject: autoReject || score < 40,
    };
  }
  
  export function getValidationMessage(result: ValidationResult): string {
    if (result.autoReject) {
      return `Publicación RECHAZADA automáticamente. Score: ${result.score}/100. Razones: ${result.reasons.join(', ')}`;
    } else if (!result.isValid) {
      return `Publicación requiere MODERACIÓN MANUAL. Score: ${result.score}/100. Razones: ${result.reasons.join(', ')}`;
    } else if (result.score < 80) {
      return `Publicación APROBADA con advertencias. Score: ${result.score}/100. Razones: ${result.reasons.join(', ')}`;
    } else {
      return `Publicación APROBADA. Score: ${result.score}/100`;
    }
  }
  