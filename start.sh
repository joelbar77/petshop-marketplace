#!/bin/bash

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
cd backend
npm install

# Ejecutar migraciones de Prisma
echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

# Iniciar el servidor
echo "Iniciando el servidor..."
npm start