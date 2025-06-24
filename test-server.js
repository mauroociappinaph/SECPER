/**
 * Script de prueba para verificar que el servidor funciona correctamente
 */

const http = require('http');

const testEndpoints = [
  { path: '/', method: 'GET', description: 'Health check principal' },
  { path: '/health', method: 'GET', description: 'Health check detallado' },
  { path: '/api/chat/health', method: 'GET', description: 'Health check del módulo de chat' },
  { path: '/api/pdf/capabilities', method: 'GET', description: 'Capacidades del módulo PDF' },
];

const HOST = 'localhost';
const PORT = 3000;

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            endpoint: endpoint,
            status: res.statusCode,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            endpoint: endpoint,
            status: res.statusCode,
            data: data,
            parseError: error.message,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        endpoint: endpoint,
        error: error.message,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject({
        endpoint: endpoint,
        error: 'Request timeout',
      });
    });

    req.end();
  });
}

async function testServer() {
  console.log('🧪 Iniciando pruebas del servidor...\n');
  console.log(`📡 Servidor: http://${HOST}:${PORT}\n`);

  const results = [];

  for (const endpoint of testEndpoints) {
    try {
      console.log(`⏳ Probando: ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      const result = await makeRequest(endpoint);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ ${endpoint.path}: ${result.status} - OK`);
      } else {
        console.log(`⚠️  ${endpoint.path}: ${result.status} - Warning`);
      }
      
      results.push(result);
    } catch (error) {
      console.log(`❌ ${endpoint.path}: Error - ${error.error}`);
      results.push(error);
    }
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Resumen de resultados:\n');
  
  results.forEach((result, index) => {
    const endpoint = testEndpoints[index];
    console.log(`${index + 1}. ${endpoint.method} ${endpoint.path}`);
    console.log(`   Descripción: ${endpoint.description}`);
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    } else {
      console.log(`   📊 Status: ${result.status}`);
      if (result.data && typeof result.data === 'object') {
        console.log(`   📄 Respuesta: ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`);
      }
    }
    console.log('');
  });

  const successCount = results.filter(r => !r.error && r.status >= 200 && r.status < 300).length;
  const totalCount = results.length;
  
  console.log(`🎯 Resultados: ${successCount}/${totalCount} endpoints funcionando correctamente`);
  
  if (successCount === totalCount) {
    console.log('🎉 ¡Todos los endpoints están funcionando!');
    process.exit(0);
  } else {
    console.log('⚠️  Algunos endpoints tienen problemas. Revisa los logs del servidor.');
    process.exit(1);
  }
}

// Verificar si el servidor está ejecutándose
console.log('🔍 Verificando si el servidor está ejecutándose...');

const checkServer = http.request({
  hostname: HOST,
  port: PORT,
  path: '/',
  method: 'GET',
  timeout: 2000,
}, (res) => {
  console.log('✅ Servidor detectado, iniciando pruebas...\n');
  testServer();
});

checkServer.on('error', (error) => {
  console.log('❌ No se pudo conectar al servidor.');
  console.log('💡 Asegúrate de que el servidor esté ejecutándose con: npm run dev');
  console.log(`📡 URL esperada: http://${HOST}:${PORT}`);
  console.log(`🔧 Error: ${error.message}`);
  process.exit(1);
});

checkServer.on('timeout', () => {
  console.log('⏰ Timeout al conectar con el servidor.');
  console.log('💡 Asegúrate de que el servidor esté ejecutándose con: npm run dev');
  process.exit(1);
});

checkServer.end();