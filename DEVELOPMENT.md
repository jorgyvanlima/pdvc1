# PDVWeb C1 - Ambiente Local Setup

## Pré-requisitos

- Docker 24.x
- Docker Compose 2.x
- Git

## Instalação Rápida

### 1. Clone o repositório

```bash
git clone <seu-repo>
cd PDVWeb-C1
```

### 2. Configure as variáveis de ambiente

```bash
cp apps/backend/.env.example apps/backend/.env.local
cp apps/frontend/.env.example apps/frontend/.env.local
```

### 3. Inicie os containers

```bash
docker-compose up -d
```

### 4. Aguarde os serviços iniciarem (2-3 minutos)

```bash
docker-compose logs -f backend
```

### 5. Acesse a aplicação

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1
- **Health Check:** http://localhost:3001/health
- **MySQL:** localhost:3306
- **Redis:** localhost:6379

## Estrutura do Projeto

```
PDVWeb-C1/
├── apps/
│   ├── backend/          # API Node.js/Express
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   └── package.json
│   │
│   └── frontend/         # Next.js React
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── package.json
│
├── docs/                 # Documentação
├── docker-compose.yml    # Orquestração dos containers
└── README.md
```

## Comandos Úteis

### Docker Compose

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f [service-name]

# Reconstruir images
docker-compose build --no-cache

# Executar comando em container
docker-compose exec backend npm run prisma:migrate
```

### Desenvolvimento Backend

```bash
# Dentro do container backend
npm run dev             # Dev mode com hot-reload
npm run build           # Build TypeScript
npm run test            # Executar testes
npm run prisma:migrate  # Migrações do Prisma
npm run prisma:seed     # Seed do banco
```

### Desenvolvimento Frontend

```bash
# Dentro do container frontend
npm run dev             # Dev mode
npm run build           # Build estático
npm run lint            # ESLint
npm run type-check      # TypeScript check
```

## Database

### Acessar MySQL

```bash
docker-compose exec db mysql -u pdvweb -p pdvweb_c1
# Password: pdvweb_secure_pass
```

### Migrações

```bash
# No diretório do backend
npx prisma migrate dev   # Criar nova migração
npx prisma studio        # UI para queries
npx prisma seed          # Seed dados
```

## Troubleshooting

### Porta já em uso

```bash
# Mudar porta no docker-compose.yml
# Exemplo: mudar port de 3000 para 3002
```

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Reconstruir
docker-compose up -d --build
```

### Banco não conecta

```bash
# Esperar saúde do container
docker-compose logs db

# Reiniciar
docker-compose restart db
```

## Variáveis de Ambiente

### Backend (.env)

```
DATABASE_URL=mysql://user:pass@host:port/db
JWT_SECRET=seu-secret-key
CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://redis:6379
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_API_WS=ws://localhost:3001
```

## Performance

### Recommended Docker Settings

- **Memory:** 4GB mínimo
- **CPU:** 2 cores
- **Disk:** 20GB

### Tipis de Build

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# Development com hot-reload
docker-compose up -d
```

## Próximos Passos

1. Implementar autenticação JWT
2. Criar CRUD endpoints
3. Integrar Prisma com banco
4. Desenvolver componentes React
5. Implementar Socket.IO real-time
6. Adicionar testes

## Suporte

Para problemas, consulte a documentação técnica em `/docs`.

---

**Desenvolvido com ❤️ para PDVWeb C1**
