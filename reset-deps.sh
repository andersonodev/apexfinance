#!/bin/bash

echo "🧹 Limpando cache e reinstalando dependências..."

# Remove node_modules e package-lock.json
rm -rf node_modules
rm -f package-lock.json

# Limpa o cache do npm
npm cache clean --force

# Reinstala as dependências
npm install

# Verifica se o Next.js está funcionando
echo "✅ Verificando instalação..."
npm run build --dry-run

echo "🚀 Pronto! Tente executar 'npm run dev' agora."
