# 🧪 Ejemplos de Uso - Mi ChatGPT

## 🚀 Cómo ejecutar el proyecto

### 1. Modo Desarrollo:
```bash
npm run dev
```

### 2. Modo Producción:
```bash
npm run build
npm start
```

## 📡 Endpoints disponibles

### 🏠 **Endpoint Base**
```
GET http://localhost:3000/
```
Respuesta: "Servidor de calendario funcionando"

---

### 📅 **Crear Evento de Calendario**
```
POST http://localhost:3000/api/calendario/evento
Content-Type: application/json

{
  "summary": "Reunión con cliente",
  "description": "Discutir propuesta de proyecto",
  "start": "2024-12-20T10:00:00Z",
  "end": "2024-12-20T11:00:00Z",
  "attendees": ["cliente@empresa.com", "equipo@miempresa.com"]
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3000/api/calendario/evento \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Reunión importante",
    "description": "Revisión de proyecto",
    "start": "2024-12-20T14:00:00Z",
    "end": "2024-12-20T15:00:00Z",
    "attendees": ["test@email.com"]
  }'
```

---

### 📄 **Analizar PDF con IA**
```
POST http://localhost:3000/api/pdf/read
Content-Type: multipart/form-data

Form Data:
- archivo: [archivo.pdf]
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3000/api/pdf/read \
  -F "archivo=@/ruta/a/tu/documento.pdf"
```

**Ejemplo con JavaScript (Frontend):**
```javascript
const formData = new FormData();
formData.append('archivo', pdfFile); // pdfFile es un File object

fetch('http://localhost:3000/api/pdf/read', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## 🔧 Variables de Entorno

Asegúrate de tener configurado tu `.env`:
```
MISTRAL_API_KEY="tu_api_key_de_mistral"
PORT=3000
```

## 🧪 Testing con Postman/Insomnia

### Colección para Postman:
```json
{
  "info": {
    "name": "Mi ChatGPT API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": [""]
        }
      }
    },
    {
      "name": "Crear Evento",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"summary\": \"Test Event\",\n  \"description\": \"Evento de prueba\",\n  \"start\": \"2024-12-20T10:00:00Z\",\n  \"end\": \"2024-12-20T11:00:00Z\",\n  \"attendees\": [\"test@email.com\"]\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/calendario/evento",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "calendario", "evento"]
        }
      }
    },
    {
      "name": "Analizar PDF",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "archivo",
              "type": "file",
              "src": "/path/to/your/file.pdf"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:3000/api/pdf/read",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "pdf", "read"]
        }
      }
    }
  ]
}
```

## 🔍 Casos de Uso

### 1. **Asistente Personal**
- Crear eventos automáticamente desde conversaciones
- Analizar documentos y extraer información clave

### 2. **Automatización de Oficina**
- Procesar facturas/contratos en PDF
- Programar reuniones automáticamente

### 3. **Integración con Chatbots**
- Backend para chatbots que necesiten crear eventos
- Análisis inteligente de documentos subidos por usuarios

## 🚨 Troubleshooting

### Error: "MISTRAL_API_KEY no definida"
- Verificar que el archivo `.env` existe
- Verificar que la variable está correctamente definida

### Error: "No se envió ningún archivo PDF"
- Asegurar que el campo del form se llama "archivo"
- Verificar que el Content-Type es multipart/form-data

### Error de conexión con Zapier
- Verificar que la URL de Zapier MCP es correcta
- Verificar conectividad a internet