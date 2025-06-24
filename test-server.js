// Script simple para probar el servidor
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testServer() {
  console.log('🧪 Probando servidor Mi ChatGPT...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Probando health check...');
    const healthResponse = await axios.get(BASE_URL);
    console.log('✅ Health check OK:', healthResponse.data);
    console.log('');
    
    // Test 2: Crear evento
    console.log('2️⃣ Probando creación de evento...');
    const eventData = {
      summary: 'Reunión de prueba',
      description: 'Evento creado desde script de test',
      start: '2024-12-20T10:00:00Z',
      end: '2024-12-20T11:00:00Z',
      attendees: ['test@email.com']
    };
    
    const eventResponse = await axios.post(`${BASE_URL}/api/calendario/evento`, eventData);
    console.log('✅ Evento creado:', eventResponse.data);
    console.log('');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Error: El servidor no está ejecutándose');
      console.log('💡 Ejecuta: npm run dev');
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
}

// Ejecutar solo si el servidor está corriendo
testServer();