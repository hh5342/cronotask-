#!/bin/bash
# Script de 1 solo clic para Mac: inicia Cronotask y abre el navegador automáticamente
cd "$(dirname "$0")"

echo "==========================================================="
echo "   Iniciando Cronotask (Cronómetro y Analítica de Tiempo)   "
echo "==========================================================="
echo ""

# Comprobar e instalar node_modules si no existen todavía
if [ ! -d "node_modules" ]; then
  echo "Primera ejecución detectada: instalando dependencias..."
  npm install --legacy-peer-deps
  if [ $? -ne 0 ]; then
    echo "Error al instalar dependencias. Reintentando con --force..."
    npm install --force
  fi
fi

echo "Abriendo la aplicación en tu navegador..."
(sleep 2 && open "http://localhost:3000") &

# Inicia el servidor
npm run dev
