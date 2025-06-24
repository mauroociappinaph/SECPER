# Mi ChatGPT API - Documentación

## Descripción General

API REST para un ChatGPT personalizado que incluye funcionalidades de:
- 📅 **Calendario**: Creación de eventos usando Zapier MCP
- 💬 **Chat**: Conversaciones con Mistral AI
- 📄 **PDF**: Extracción de texto y análisis con OCR
- 🗂️ **Google Drive**: Integración completa con Google Drive para gestión de PDFs

## Configuración

### Variables de Entorno

```bash
# Configuración de Mistral AI
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-large-latest

# Configuración de Zapier MCP
ZAPIER_MCP_URL=https://api.zapier.com/v1/mcp/calendar

# Configuración de Google Drive
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Configuración del servidor
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Instalación

```bash
npm install
npm run build
npm start
```

### Desarrollo

```bash
npm run dev
```

## Endpoints

### 🏥 Health Check

#### `GET /`
Información general del servidor

**Respuesta:**
```json
{
  "message": "Mi ChatGPT API - Servidor funcionando correctamente",
  "version": "1.0.0",
  "timestamp": "2024-06-24T12:00:00.000Z",
  "endpoints": {
    "calendar": "/api/calendario",
    "chat": "/api/chat",
    "pdf": "/api/pdf",
    "drive": "/api/drive"
  },
  "status": "healthy"
}
```

#### `GET /health`
Estado detallado del servidor

**Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-24T12:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  },
  "version": "v18.17.0",
  "environment": "development"
}
```

---

## 📅 Módulo de Calendario

### `POST /api/calendario/evento`
Crea un nuevo evento en el calendario usando Zapier MCP.

**Body:**
```json
{
  "summary": "Reunión de equipo",
  "description": "Reunión semanal del equipo de desarrollo",
  "start": "2024-06-25T10:00:00Z",
  "end": "2024-06-25T11:00:00Z",
  "attendees": ["usuario1@email.com", "usuario2@email.com"]
}
```

**Campos:**
- `summary` (string, requerido): Título del evento (máx. 200 caracteres)
- `description` (string, opcional): Descripción del evento (máx. 1000 caracteres)
- `start` (string, requerido): Fecha/hora de inicio en formato ISO 8601
- `end` (string, requerido): Fecha/hora de fin en formato ISO 8601
- `attendees` (array, opcional): Lista de emails de invitados (máx. 50)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "eventId": "evt_123456",
  "message": "Evento creado exitosamente"
}
```

**Errores comunes:**
- `400`: Datos de validación incorrectos
- `500`: Error en el servicio de Zapier

---

## 💬 Módulo de Chat

### `POST /api/chat/message`
Envía un mensaje al chat y obtiene respuesta de Mistral AI.

**Body:**
```json
{
  "message": "¿Cuál es la capital de Francia?",
  "conversationId": "conv_123456",
  "systemPrompt": "Eres un asistente útil",
  "model": "mistral-large-latest",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Campos:**
- `message` (string, requerido): Mensaje del usuario
- `conversationId` (string, opcional): ID de conversación existente
- `systemPrompt` (string, opcional): Prompt del sistema
- `model` (string, opcional): Modelo de Mistral a usar
- `temperature` (number, opcional): Temperatura para la generación (0-1)
- `maxTokens` (number, opcional): Máximo número de tokens

**Respuesta:**
```json
{
  "message": {
    "id": "msg_123456",
    "role": "assistant",
    "content": "La capital de Francia es París.",
    "timestamp": "2024-06-24T12:00:00.000Z",
    "conversationId": "conv_123456"
  },
  "conversationId": "conv_123456",
  "usage": {
    "promptTokens": 15,
    "completionTokens": 8,
    "totalTokens": 23
  }
}
```

### `GET /api/chat/conversations`
Obtiene todas las conversaciones con paginación.

**Query Parameters:**
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Elementos por página (default: 20)

**Respuesta:**
```json
{
  "conversations": [
    {
      "id": "conv_123456",
      "title": "Conversación sobre Francia",
      "createdAt": "2024-06-24T12:00:00.000Z",
      "updatedAt": "2024-06-24T12:05:00.000Z",
      "messageCount": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/chat/conversations/:conversationId`
Obtiene una conversación específica con todos sus mensajes.

**Respuesta:**
```json
{
  "id": "conv_123456",
  "title": "Conversación sobre Francia",
  "createdAt": "2024-06-24T12:00:00.000Z",
  "updatedAt": "2024-06-24T12:05:00.000Z",
  "messages": [
    {
      "id": "msg_123456",
      "role": "user",
      "content": "¿Cuál es la capital de Francia?",
      "timestamp": "2024-06-24T12:00:00.000Z"
    },
    {
      "id": "msg_123457",
      "role": "assistant",
      "content": "La capital de Francia es París.",
      "timestamp": "2024-06-24T12:00:05.000Z"
    }
  ]
}
```

### `DELETE /api/chat/conversations/:conversationId`
Elimina una conversación específica.

**Respuesta:**
```json
{
  "success": true,
  "message": "Conversación eliminada exitosamente"
}
```

### `PUT /api/chat/conversations/:conversationId/title`
Actualiza el título de una conversación.

**Body:**
```json
{
  "title": "Nuevo título de la conversación"
}
```

### `GET /api/chat/search`
Busca en conversaciones por texto.

**Query Parameters:**
- `query` (string, requerido): Texto a buscar

**Respuesta:**
```json
{
  "results": [
    {
      "conversationId": "conv_123456",
      "title": "Conversación sobre Francia",
      "matches": [
        {
          "messageId": "msg_123456",
          "content": "¿Cuál es la capital de Francia?",
          "role": "user"
        }
      ]
    }
  ],
  "totalResults": 1
}
```

### `GET /api/chat/stats`
Obtiene estadísticas del chat.

**Respuesta:**
```json
{
  "totalConversations": 10,
  "totalMessages": 45,
  "averageMessagesPerConversation": 4.5,
  "oldestConversation": "2024-06-20T10:00:00.000Z",
  "newestConversation": "2024-06-24T12:00:00.000Z"
}
```

### `GET /api/chat/health`
Verifica el estado del módulo de chat.

**Respuesta:**
```json
{
  "status": "healthy",
  "mistralConfigured": true,
  "timestamp": "2024-06-24T12:00:00.000Z"
}
```

---

## 📄 Módulo de PDF

### `POST /api/pdf/extract-text`
Extrae texto de un archivo PDF usando pdf-parse.

**Body:** FormData con archivo PDF
- `pdf` (file, requerido): Archivo PDF (máx. 10MB)

**Respuesta:**
```json
{
  "text": "Contenido extraído del PDF...",
  "metadata": {
    "filename": "documento.pdf",
    "size": 1048576,
    "textLength": 2500,
    "processedAt": "2024-06-24T12:00:00.000Z"
  }
}
```

### `POST /api/pdf/analyze`
Analiza un PDF usando Mistral AI OCR.

**Body:** FormData con archivo PDF
- `pdf` (file, requerido): Archivo PDF (máx. 10MB)

**Respuesta:**
```json
{
  "result": {
    "text": "Texto extraído con OCR...",
    "confidence": 0.95,
    "pages": 3,
    "language": "es"
  },
  "metadata": {
    "filename": "documento.pdf",
    "size": 1048576,
    "processedAt": "2024-06-24T12:00:00.000Z"
  }
}
```

### `GET /api/pdf/capabilities`
Obtiene las capacidades del servicio PDF.

**Respuesta:**
```json
{
  "textExtraction": true,
  "mistralOcr": true,
  "supportedFormats": ["application/pdf"],
  "maxFileSize": "10MB"
}
```

### `GET /api/pdf/health`
Verifica el estado del módulo PDF.

**Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-24T12:00:00.000Z",
  "capabilities": {
    "textExtraction": true,
    "mistralOcr": true,
    "supportedFormats": ["application/pdf"],
    "maxFileSize": "10MB"
  },
  "services": {
    "textExtraction": true,
    "mistralOcr": true
  }
}
```

---

## 🚨 Manejo de Errores

Todos los endpoints devuelven errores en el siguiente formato:

```json
{
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "timestamp": "2024-06-24T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Códigos de Error Comunes

- `VALIDATION_ERROR` (400): Error de validación de datos
- `NOT_FOUND_ERROR` (404): Recurso no encontrado
- `CALENDAR_ERROR` (500): Error en el servicio de calendario
- `CHAT_ERROR` (500): Error en el servicio de chat
- `PDF_ERROR` (500): Error en el servicio de PDF
- `MISTRAL_NOT_CONFIGURED` (500): API key de Mistral no configurada
- `FILE_TOO_LARGE` (413): Archivo demasiado grande
- `INVALID_FILE_TYPE` (400): Tipo de archivo no válido

---

## 🔧 Desarrollo

### Estructura del Proyecto

```
backend/
├── server.ts                 # Servidor principal
├── config/
│   └── constants.ts          # Constantes de configuración
├── middleware/
│   └── errorHandler.ts       # Middleware de manejo de errores
├── utils/
│   └── errors.ts            # Clases de error personalizadas
├── types/
│   ├── index.ts             # Exportaciones de tipos
│   ├── calendar.interfaces.ts
│   ├── chat.interfaces.ts
│   └── multer.interfaces.ts
├── calendar/
│   ├── calendarRoutes.ts
│   ├── controllers/
│   ├── services/
│   └── utils/
├── chat/
│   ├── chatRoutes.ts
│   ├── controllers/
│   ├── services/
│   └── utils/
└── pdf/
    ├── pdfRoutes.ts
    ├── controllers/
    ├── services/
    └── utils/
```

### Scripts Disponibles

- `npm run dev`: Desarrollo con recarga automática
- `npm run build`: Compilar TypeScript
- `npm start`: Ejecutar versión compilada
- `npm run lint`: Verificar código con ESLint
- `npm run format`: Formatear código con Prettier
- `npm run type-check`: Verificar tipos de TypeScript

### Testing

Para probar los endpoints, puedes usar el archivo `frontend-test.html` incluido en el proyecto o herramientas como Postman/Insomnia.

---

## 🗂️ Google Drive

### Autenticación

#### `GET /api/drive/auth-url`
Obtiene la URL de autorización de Google OAuth

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/oauth/authorize?...",
    "message": "Visita esta URL para autorizar el acceso a Google Drive"
  }
}
```

#### `POST /api/drive/auth-callback`
Maneja el callback de autorización OAuth

**Body:**
```json
{
  "code": "authorization_code_from_google"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "message": "Autorización exitosa",
    "hasRefreshToken": true
  }
}
```

### Gestión de Archivos

#### `POST /api/drive/upload`
Sube un archivo PDF a Google Drive

**Body:** FormData
- `pdf`: Archivo PDF (required)
- `folderId`: ID de carpeta destino (optional)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "filename": "documento.pdf",
    "webViewLink": "https://drive.google.com/file/d/...",
    "webContentLink": "https://drive.google.com/uc?id=...",
    "message": "Archivo subido exitosamente a Google Drive"
  }
}
```

#### `GET /api/drive/download/:fileId`
Descarga un archivo PDF desde Google Drive

**Respuesta:** Archivo PDF binario

#### `DELETE /api/drive/delete/:fileId`
Elimina un archivo PDF de Google Drive

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "message": "Archivo eliminado exitosamente de Google Drive",
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
  }
}
```

#### `GET /api/drive/info/:fileId`
Obtiene información de un archivo

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "name": "documento.pdf",
    "size": "1024000",
    "mimeType": "application/pdf",
    "createdTime": "2024-01-15T10:30:00.000Z",
    "modifiedTime": "2024-01-15T10:30:00.000Z",
    "webViewLink": "https://drive.google.com/file/d/...",
    "webContentLink": "https://drive.google.com/uc?id=..."
  }
}
```

### Búsqueda y Listado

#### `GET /api/drive/list`
Lista archivos PDF en Google Drive

**Query Parameters:**
- `folderId`: ID de carpeta (optional)
- `pageSize`: Número de archivos por página (optional, default: 10, max: 100)
- `pageToken`: Token de paginación (optional)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        "name": "documento.pdf",
        "size": "1024000",
        "createdTime": "2024-01-15T10:30:00.000Z",
        "modifiedTime": "2024-01-15T10:30:00.000Z",
        "webViewLink": "https://drive.google.com/file/d/..."
      }
    ],
    "nextPageToken": "next_page_token",
    "hasMore": true,
    "count": 10
  }
}
```

#### `GET /api/drive/search`
Busca archivos PDF en Google Drive

**Query Parameters:**
- `q`: Término de búsqueda (required)
- `folderId`: ID de carpeta (optional)
- `pageSize`: Número de archivos por página (optional, default: 10, max: 100)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        "name": "documento-importante.pdf",
        "size": "1024000",
        "createdTime": "2024-01-15T10:30:00.000Z",
        "modifiedTime": "2024-01-15T10:30:00.000Z",
        "webViewLink": "https://drive.google.com/file/d/..."
      }
    ],
    "searchTerm": "importante",
    "count": 1
  }
}
```

### Gestión de Carpetas

#### `POST /api/drive/create-folder`
Crea una carpeta en Google Drive

**Body:**
```json
{
  "name": "Mi Carpeta",
  "parentFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "folderId": "1NewFolderIdHere",
    "name": "Mi Carpeta",
    "parentFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "message": "Carpeta creada exitosamente en Google Drive"
  }
}
```

### Información del Servicio

#### `GET /api/drive/capabilities`
Obtiene las capacidades del servicio Google Drive

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "upload": true,
    "download": true,
    "search": true,
    "delete": true,
    "createFolder": true,
    "maxFileSize": "100MB",
    "supportedFormats": ["application/pdf"],
    "validationRules": {
      "maxFileSize": 104857600,
      "maxFileSizeMB": 100,
      "allowedMimeTypes": ["application/pdf"],
      "allowedExtensions": ["pdf"],
      "maxPageSize": 100,
      "maxSearchTermLength": 100,
      "maxFolderNameLength": 255
    },
    "isConfigured": true
  }
}
```

#### `GET /api/drive/health`
Verifica el estado del módulo Google Drive

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "capabilities": {
      "upload": true,
      "download": true,
      "search": true,
      "delete": true,
      "createFolder": true,
      "maxFileSize": "100MB",
      "supportedFormats": ["application/pdf"]
    },
    "message": "Google Drive service is configured and ready"
  }
}
```

---

## 📝 Notas

- Todos los timestamps están en formato ISO 8601 UTC
- Los archivos PDF tienen un límite de 10MB para el módulo PDF local y 100MB para Google Drive
- Las conversaciones se almacenan en memoria (se pierden al reiniciar el servidor)
- Se requiere configurar las variables de entorno para funcionalidad completa
- **Google Drive requiere autenticación OAuth2** antes de usar cualquier endpoint (excepto `/auth-url` y `/health`)
- Los tokens de acceso se mantienen en memoria y se pierden al reiniciar el servidor