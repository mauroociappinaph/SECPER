# Sistema de Errores Modularizado

Este directorio contiene el sistema de manejo de errores modularizado de la aplicación.

## Estructura

```
errors/
├── index.ts          # Punto de entrada principal
├── base.ts           # Clases base y tipos fundamentales
├── http.ts           # Errores HTTP específicos (4xx, 5xx)
├── services.ts       # Errores específicos de servicios
├── factory.ts        # Factory para crear errores complejos
├── utils.ts          # Utilidades para manejo de errores
└── README.md         # Esta documentación
```

## Uso

### Importación básica
```typescript
import { AppError, ValidationError, ServiceErrorFactory } from '../utils/errors';
```

### Errores simples
```typescript
// Error de validación
throw new ValidationError('El email es requerido', { field: 'email' });

// Error de autenticación
throw new AuthenticationError('Token inválido');

// Error de servicio específico
throw new ChatServiceError('Error al conectar con Mistral API');
```

### Errores avanzados con contexto
```typescript
import { ServiceErrorFactory, ErrorUtils } from '../utils/errors';

// Crear contexto desde request
const context = ErrorUtils.createErrorContext(req);

// Error con contexto completo
const error = ServiceErrorFactory.createChatError(
  'Error al procesar mensaje',
  'CHAT_PROCESSING_ERROR',
  context,
  { messageId: '123', userId: 'user456' }
);

throw error;
```

### Manejo de errores
```typescript
import { ErrorUtils, EnhancedAppError } from '../utils/errors';

try {
  // Operación que puede fallar
} catch (error) {
  // Normalizar error desconocido
  const normalizedError = ErrorUtils.normalizeError(error);
  
  // Verificar si es retryable
  if (ErrorUtils.isRetryable(normalizedError)) {
    const retryAfter = ErrorUtils.getRetryAfter(normalizedError);
    // Implementar lógica de retry
  }
  
  // Sanitizar para logging
  const sanitizedError = ErrorUtils.sanitizeError(normalizedError);
  console.error('Error sanitizado:', sanitizedError);
}
```

## Tipos de Errores

### Errores Base
- `AppError`: Error base de la aplicación
- `EnhancedAppError`: Error con contexto y categorización avanzada

### Errores HTTP
- `ValidationError` (400): Errores de validación
- `AuthenticationError` (401): Errores de autenticación
- `AuthorizationError` (403): Errores de autorización
- `NotFoundError` (404): Recurso no encontrado
- `ConflictError` (409): Conflicto de recursos
- `RateLimitError` (429): Límite de tasa excedido

### Errores de Servicios
- `CalendarServiceError`: Errores del servicio de calendario
- `ChatServiceError`: Errores del servicio de chat
- `PDFServiceError`: Errores del servicio de PDF
- `GoogleDriveServiceError`: Errores del servicio de Google Drive
- `DatabaseError`: Errores de base de datos
- `NetworkError`: Errores de red/conectividad

## Categorías y Severidad

### Categorías
- `VALIDATION`: Errores de validación
- `AUTHENTICATION`: Errores de autenticación
- `AUTHORIZATION`: Errores de autorización
- `NOT_FOUND`: Recurso no encontrado
- `CONFLICT`: Conflicto de recursos
- `RATE_LIMIT`: Límite de tasa
- `EXTERNAL_SERVICE`: Errores de servicios externos
- `DATABASE`: Errores de base de datos
- `NETWORK`: Errores de red
- `INTERNAL`: Errores internos

### Severidad
- `LOW`: Severidad baja
- `MEDIUM`: Severidad media
- `HIGH`: Severidad alta
- `CRITICAL`: Severidad crítica

## Características

### Retry Logic
Los errores pueden marcarse como retryables con un tiempo de espera específico:

```typescript
const error = new EnhancedAppError(
  'Error temporal',
  'TEMP_ERROR',
  503,
  ErrorCategory.EXTERNAL_SERVICE,
  ErrorSeverity.MEDIUM,
  {
    isRetryable: true,
    retryAfter: 5000 // 5 segundos
  }
);
```

### Sanitización
Los errores se sanitizan automáticamente para remover información sensible:

```typescript
const sanitized = ErrorUtils.sanitizeError(error);
// Información sensible como passwords, tokens, etc. se reemplaza con [REDACTED]
```

### Contexto de Request
Se puede capturar automáticamente el contexto de una request HTTP:

```typescript
const context = ErrorUtils.createErrorContext(req);
// Incluye: requestId, endpoint, method, userAgent, ip, timestamp, etc.
```

## Migración

Para migrar del sistema anterior:

1. Reemplazar imports:
   ```typescript
   // Antes
   import { AppError, ChatServiceError } from '../utils/errors';
   
   // Después (sin cambios)
   import { AppError, ChatServiceError } from '../utils/errors';
   ```

2. El archivo `errors/index.ts` re-exporta todo para mantener compatibilidad.

3. Gradualmente adoptar las nuevas características como `ServiceErrorFactory` y `ErrorUtils`.