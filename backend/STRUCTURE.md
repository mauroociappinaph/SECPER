# Estructura del Backend

Este documento describe la organización y estructura del backend de la aplicación.

## 📁 Estructura General

```
backend/
├── __tests__/              # Tests de integración
├── calendar/               # Módulo de calendario
├── chat/                   # Módulo de chat y conversaciones
├── config/                 # Configuración centralizada
├── database/               # Conexión y operaciones de BD
├── google-drive/           # Integración con Google Drive
├── health/                 # Health checks y monitoreo
├── middleware/             # Middleware de Express
├── pdf/                    # Procesamiento de PDFs
├── routes/                 # Enrutamiento principal
├── types/                  # Tipos e interfaces TypeScript
├── utils/                  # Utilidades generales
└── server.ts              # Punto de entrada principal
```

## 🏗️ Patrón de Organización por Módulo

Cada módulo funcional sigue esta estructura consistente:

```
module/
├── __tests__/             # Tests específicos del módulo
├── controllers/           # Controladores HTTP
├── services/             # Lógica de negocio
├── utils/                # Utilidades específicas del módulo
├── index.ts              # Punto de entrada del módulo
└── moduleRoutes.ts       # Rutas del módulo
```

## 📋 Módulos Detallados

### 🗓️ Calendar
```
calendar/
├── __tests__/
│   └── calendarService.test.ts
├── controllers/
│   └── calendarController.ts
├── services/
│   └── calendarService.ts
├── utils/
│   └── calendarValidators.ts
├── index.ts
└── calendarRoutes.ts
```

### 💬 Chat
```
chat/
├── __tests__/
│   ├── chatService.test.ts
│   └── conversationService.test.ts
├── controllers/
│   ├── conversationController.ts
│   ├── messageController.ts
│   └── searchController.ts
├── services/
│   ├── chatService.ts
│   ├── conversationService.ts
│   └── mistralService.ts
├── utils/
│   └── chatValidators.ts
├── index.ts
└── chatRoutes.ts
```

### 📁 Google Drive
```
google-drive/
├── __tests__/
│   └── services/
│       ├── authService.test.ts
│       ├── driveService.test.ts
│       ├── fileOperationsService.test.ts
│       └── searchService.test.ts
├── controllers/
│   └── driveController.ts
├── services/
│   ├── auth/
│   │   └── authService.ts
│   ├── files/
│   │   └── fileOperationsService.ts
│   ├── search/
│   │   └── searchService.ts
│   └── driveService.ts
├── utils/
│   └── driveValidators.ts
├── index.ts
└── driveRoutes.ts
```

### 📄 PDF
```
pdf/
├── __tests__/
│   └── pdfService.test.ts
├── controllers/
│   └── pdfController.ts
├── services/
│   └── pdfService.ts
├── utils/
│   └── pdfValidators.ts
├── index.ts
└── pdfRoutes.ts
```

### 🏥 Health
```
health/
├── __tests__/
│   └── healthCheckService.test.ts
├── healthCheckService.ts
├── healthRoutes.ts
├── serviceRegistry.ts
└── index.ts
```

## 🔧 Módulos de Infraestructura

### ⚙️ Config
```
config/
├── configService.ts      # Servicio de configuración centralizada
├── constants.ts          # Constantes de la aplicación
└── index.ts
```

### 🗄️ Database
```
database/
├── prisma.ts            # Cliente Prisma y conexión
└── index.ts
```

### 🛡️ Middleware
```
middleware/
├── errorHandler.ts      # Manejo de errores y logging
└── index.ts
```

### 🛣️ Routes
```
routes/
├── routes.ts           # Enrutador principal
└── index.ts
```

### 📝 Types
```
types/
├── calendar.interfaces.ts    # Interfaces de calendario
├── chat.interfaces.ts        # Interfaces de chat
├── database.interfaces.ts    # Interfaces de base de datos
├── multer.interfaces.ts      # Interfaces de Multer
├── services.interfaces.ts    # Interfaces de servicios
└── index.ts                  # Exportaciones centralizadas
```

### 🔧 Utils
```
utils/
├── errors/                   # Sistema de errores modularizado
│   ├── base.ts              # Clases base y tipos
│   ├── factory.ts           # Factory de errores
│   ├── http.ts              # Errores HTTP
│   ├── services.ts          # Errores de servicios
│   ├── utils.ts             # Utilidades de errores
│   ├── index.ts             # Punto de entrada
│   └── README.md            # Documentación
├── errors.ts                # Proxy de compatibilidad
└── index.ts
```

## 📏 Convenciones de Naming

### Archivos
- **Controladores**: `moduleController.ts`
- **Servicios**: `moduleService.ts`
- **Rutas**: `moduleRoutes.ts`
- **Validadores**: `moduleValidators.ts`
- **Tests**: `module.test.ts`
- **Índices**: `index.ts`

### Clases y Interfaces
- **Clases**: `PascalCase` (ej: `ChatService`)
- **Interfaces**: `IPascalCase` (ej: `IChatService`)
- **Types**: `PascalCase` (ej: `ChatMessage`)
- **Enums**: `PascalCase` (ej: `ErrorCategory`)

### Variables y Funciones
- **Variables**: `camelCase` (ej: `chatService`)
- **Funciones**: `camelCase` (ej: `createMessage`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `MAX_FILE_SIZE`)

## 🎯 Principios de Organización

### 1. **Separación de Responsabilidades**
- Cada módulo tiene una responsabilidad específica
- Controllers manejan HTTP, Services manejan lógica de negocio
- Utils contienen funciones auxiliares reutilizables

### 2. **Consistencia**
- Todos los módulos siguen la misma estructura
- Naming conventions uniformes
- Patrones de export/import consistentes

### 3. **Modularidad**
- Cada módulo es independiente
- Dependencias claras y explícitas
- Fácil testing y mantenimiento

### 4. **Escalabilidad**
- Estructura preparada para crecimiento
- Fácil agregar nuevos módulos
- Separación clara de concerns

## 🔄 Flujo de Datos

```
Request → Routes → Controllers → Services → Database
                      ↓
Response ← Middleware ← Utils ← Types ← Errors
```

## 📚 Documentación Adicional

- [Sistema de Errores](./utils/errors/README.md)
- [Configuración](./config/README.md) (TODO)
- [Health Checks](./health/README.md) (TODO)
- [Testing](../__tests__/README.md) (TODO)

## 🔍 Verificación de Consistencia

Para verificar que la estructura se mantiene consistente:

```bash
# Verificar tipos
npm run type-check

# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Verificar formato
npm run format:check
```