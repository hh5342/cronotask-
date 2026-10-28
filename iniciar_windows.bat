@echo off
cd /d "%~dp0"
title Cronotask - Cronometro y Analitica
echo ===========================================================
echo    Iniciando Cronotask en tu Escritorio...
echo ===========================================================
echo.

if not exist node_modules (
  echo Primera ejecucion detectada: instalando dependencias...
  call npm install --legacy-peer-deps
  if errorlevel 1 (
    call npm install --force
  )
)

echo Abriendo navegador en http://localhost:3000...
start http://localhost:3000
npm run dev
