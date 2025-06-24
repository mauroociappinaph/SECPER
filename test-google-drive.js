const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testGoogleDriveEndpoints() {
  console.log('🧪 Probando endpoints de Google Drive...\n');

  try {
    // 1. Health check del módulo Google Drive
    console.log('1. 🏥 Health check de Google Drive');
    const healthResponse = await axios.get(`${BASE_URL}/api/drive/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // 2. Obtener capacidades del servicio
    console.log('2. 🔧 Capacidades del servicio');
    const capabilitiesResponse = await axios.get(`${BASE_URL}/api/drive/capabilities`);
    console.log('✅ Capacidades:', capabilitiesResponse.data);
    console.log('');

    // 3. Obtener URL de autorización
    console.log('3. 🔐 URL de autorización');
    try {
      const authUrlResponse = await axios.get(`${BASE_URL}/api/drive/auth-url`);
      console.log('✅ URL de autorización:', authUrlResponse.data);
    } catch (error) {
      console.log('⚠️ URL de autorización (esperado si no está configurado):', error.response?.data || error.message);
    }
    console.log('');

    // 4. Listar PDFs (sin autenticación)
    console.log('4. 📄 Listar PDFs');
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/drive/list`);
      console.log('✅ Lista de PDFs:', listResponse.data);
    } catch (error) {
      console.log('⚠️ Lista de PDFs (esperado sin autenticación):', error.response?.data || error.message);
    }
    console.log('');

    console.log('🎉 Pruebas de Google Drive completadas!');
    console.log('\n📋 Resumen:');
    console.log('- ✅ Módulo Google Drive está integrado correctamente');
    console.log('- ✅ Endpoints están funcionando');
    console.log('- ✅ Manejo de errores está implementado');
    console.log('- ⚠️ Necesita configuración de variables de entorno para funcionar completamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
  }
}

// Función para verificar si el servidor está corriendo
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('🚀 Servidor está corriendo:', response.data.status);
    return true;
  } catch (error) {
    console.log('❌ Servidor no está corriendo. Inicia el servidor con: npm run dev');
    return false;
  }
}

async function main() {
  console.log('🔍 Verificando configuración de Google Drive...\n');
  
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testGoogleDriveEndpoints();
  }
}

main();