#!/bin/bash

echo "🚀 Iniciando Mi ChatGPT..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado. Creando uno de ejemplo..."
    echo 'MISTRAL_API_KEY="tu_api_key_aqui"' > .env
    echo 'PORT=3000' >> .env
    echo "✅ Archivo .env creado. Por favor configura tu MISTRAL_API_KEY"
fi

# Compilar el proyecto
echo "🔨 Compilando proyecto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
    echo ""
    echo "🌟 Opciones disponibles:"
    echo "1. npm run dev    - Modo desarrollo (recomendado)"
    echo "2. npm start      - Modo producción"
    echo "3. Abrir frontend-test.html en tu navegador para probar"
    echo ""
    echo "📡 El servidor estará disponible en: http://localhost:3000"
    echo ""
    
    # Preguntar si quiere iniciar en modo desarrollo
    read -p "¿Quieres iniciar en modo desarrollo ahora? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Iniciando en modo desarrollo..."
        npm run dev
    fi
else
    echo "❌ Error en la compilación"
    exit 1
fi