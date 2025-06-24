# Mi ChatGPT - API Backend

🤖 **API REST completa para un ChatGPT personalizado** con funcionalidades de calendario, chat con IA y procesamiento de PDFs.

## ✨ Características

- 📅 **Calendario**: Creación de eventos usando Zapier MCP
- 💬 **Chat**: Conversaciones inteligentes con Mistral AI
- 📄 **PDF**: Extracción de texto y análisis con OCR
- 🛡️ **Robusto**: Manejo de errores, validaciones y logging
- 🔧 **Desarrollo**: Hot reload, linting, formateo automático
- 📚 **Documentado**: API completamente documentada

## 🚀 Inicio Rápido

### Requisitos

- Node.js >= 16
- npm >= 8

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd mi-chatgpt

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de API

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno

```bash
# Configuración de Mistral AI
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-large-latest

# Configuración de Zapier MCP
ZAPIER_MCP_URL=https://api.zapier.com/v1/mcp/calendar

# Configuración del servidor
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con hot reload
npm run build        # Compilar TypeScript
npm start           # Ejecutar versión compilada

# Calidad de código
npm run lint         # Verificar con ESLint
npm run lint:fix     # Corregir errores de ESLint
npm run format       # Formatear con Prettier
npm run type-check   # Verificar tipos TypeScript

# Git hooks
npm run prepare      # Configurar Husky
```

## 🏗️ Estructura del Proyecto

```
mi-chatgpt/
├── backend/
│   ├── server.ts                    # Servidor principal
│   ├── config/
│   │   └── constants.ts             # Configuración
│   ├── middleware/
│   │   └── errorHandler.ts          # Manejo de errores
│   ├── utils/
│   │   └── errors.ts               # Errores personalizados
│   ├── types/                      # Interfaces TypeScript
│   │   ├── calendar.interfaces.ts
│   │   ├── chat.interfaces.ts
│   │   └── multer.interfaces.ts
│   ├── calendar/                   # Módulo de calendario
│   │   ├── calendarRoutes.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── chat/                       # Módulo de chat
│   │   ├── chatRoutes.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   └── pdf/                        # Módulo de PDF
│       ├── pdfRoutes.ts
│       ├── controllers/
│       ├── services/
│       └── utils/
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── API_DOCUMENTATION.md            # Documentación completa
```

## 🌐 Endpoints Principales

### Health Check
- `GET /` - Información del servidor
- `GET /health` - Estado detallado

### 📅 Calendario
- `POST /api/calendario/evento` - Crear evento

### 💬 Chat
- `POST /api/chat/message` - Enviar mensaje
- `GET /api/chat/conversations` - Listar conversaciones
- `GET /api/chat/conversations/:id` - Obtener conversación
- `DELETE /api/chat/conversations/:id` - Eliminar conversación

### 📄 PDF
- `POST /api/pdf/extract-text` - Extraer texto
- `POST /api/pdf/analyze` - Análisis con OCR
- `GET /api/pdf/capabilities` - Capacidades del servicio

## 🧪 Testing

Usa el archivo `frontend-test.html` incluido para probar los endpoints:

```bash
# Abrir en el navegador
open frontend-test.html
```

O usa herramientas como Postman/Insomnia con la documentación en `API_DOCUMENTATION.md`.

## 🛠️ Desarrollo

### Configuración del Entorno

```bash
# Instalar dependencias de desarrollo
npm install

# Configurar Git hooks
npm run prepare

# Verificar configuración
npm run type-check
npm run lint
```

### Flujo de Desarrollo

1. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar**: Usar `npm run dev` para hot reload
3. **Verificar**: `npm run lint && npm run type-check`
4. **Commit**: Los hooks verifican automáticamente el código
5. **Push**: `git push origin feature/nueva-funcionalidad`

### Estándares de Código

- **TypeScript**: Tipado estricto
- **ESLint**: Reglas de calidad de código
- **Prettier**: Formateo automático
- **Husky**: Git hooks para verificación

## 📚 Documentación

- **API Completa**: Ver `API_DOCUMENTATION.md`
- **Ejemplos**: Ver `test-examples.md`
- **Configuración Husky**: Ver `HUSKY_SETUP.md`

## 🔧 Configuración Avanzada

### CORS

Configurar orígenes permitidos en `.env`:

```bash
CORS_ORIGINS=http://localhost:3000,https://mi-frontend.com
```

### Logging

Los logs incluyen:
- Requests/responses con timestamps
- Errores detallados con stack traces
- Métricas de rendimiento

### Manejo de Errores

- Errores personalizados con códigos específicos
- Validación robusta de entrada
- Respuestas consistentes en formato JSON

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🆘 Soporte

- **Issues**: Reportar bugs o solicitar features
- **Documentación**: Ver `API_DOCUMENTATION.md`
- **Ejemplos**: Ver `test-examples.md`

---

**¡Desarrollado con ❤️ usando Node.js, TypeScript y Mistral AI!**
