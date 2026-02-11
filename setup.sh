#!/bin/bash

# PDVWeb C1 - Quick Start Script
# Usage: bash setup.sh

set -e

echo "🚀 PDVWeb C1 - Setup Iniciado..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale Docker primeiro."
    exit 1
fi

echo "✅ Docker encontrado"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instale Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker Compose encontrado"

# Copy env files
if [ ! -f "apps/backend/.env.local" ]; then
    echo "📋 Copiando .env.example para backend..."
    cp apps/backend/.env.example apps/backend/.env.local
fi

if [ ! -f "apps/frontend/.env.local" ]; then
    echo "📋 Copiando .env.example para frontend..."
    cp apps/frontend/.env.example apps/frontend/.env.local
fi

# Build and start
echo "🐳 Iniciando containers Docker..."
docker-compose up -d --build

echo ""
echo "⏳ Aguardando serviços iniciarem (2-3 minutos)..."
sleep 30

# Check health
if docker-compose exec -T db mysqladmin ping -u root -p"$(grep DB_ROOT_PASSWORD .env.example | cut -d '=' -f 2)" &> /dev/null; then
    echo "✅ Database pronto"
else
    echo "⚠️  Database ainda inicializando..."
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📱 Acesse a aplicação:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001/api/v1/health"
echo ""
echo "🔑 Credenciais padrão:"
echo "   Email:    admin@admin.com"
echo "   Senha:    admin123"
echo ""
echo "📚 Documentação:"
echo "   - Desenvolvimento: ./DEVELOPMENT.md"
echo "   - API: ./docs/API.md"
echo "   - Banco de Dados: ./docs/DATABASE.md"
echo ""
echo "💡 Próximos passos:"
echo "   1. Mude a senha de admin"
echo "   2. Configure as integrações (Stripe, etc)"
echo "   3. Implemente lógica de negócio"
echo ""
echo "Ver logs: docker-compose logs -f [backend|frontend|db|redis]"
