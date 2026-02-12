# PDVWeb C1 - Sistema de PDV Moderno

Este projeto é uma modernização do sistema PDV legado, construído com tecnologias modernas para garantir performance, escalabilidade e facilidade de manutenção.

## 🚀 Tecnologias

- **Frontend:** Next.js (React), TailwindCSS, Zustand
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Banco de Dados:** MySQL 8.0
- **Cache:** Redis
- **Infraestrutura:** Docker e Docker Compose

## 🛠️ Como Iniciar

### Pré-requisitos
- Docker e Docker Compose instalados.

### Passo a Passo

1. **Clonar e Entrar na Pasta:**
   ```bash
   cd PDVWeb-C1
   ```

2. **Subir os Containers:**
   Execute o comando para construir e iniciar os serviços:
   ```bash
   docker compose up -d
   ```
   *Aguarde alguns minutos na primeira execução para o build e inicialização do banco de dados.*

3. **Acessar o Sistema:**
   - **Frontend (Aplicação):** [http://localhost:3000](http://localhost:3000)
   - **Backend (API):** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
   - **Health Check:** [http://localhost:3001/health](http://localhost:3001/health)

## 🔑 Credenciais de Acesso (Padrão)

O banco de dados foi inicializado com um usuário administrador padrão:

- **Email:** `admin@pdvweb.com`
- **Senha:** `123456`

## 📂 Estrutura do Projeto

```
PDVWeb-C1/
├── apps/
│   ├── backend/         # API Node.js/Express
│   │   ├── src/         # Código fonte
│   │   ├── prisma/      # Schema e Migrations do Banco
│   │   └── Dockerfile
│   └── frontend/        # Aplicação Next.js
│       ├── app/         # Páginas e Rotas
│       ├── components/  # Componentes React
│       └── Dockerfile
├── docker-compose.yml   # Orquestração dos containers
└── README.md            # Documentação
```

## ⚙️ Comandos Úteis

- **Parar o sistema:**
  ```bash
  docker compose down
  ```

- **Ver logs em tempo real:**
  ```bash
  docker compose logs -f
  ```

- **Reiniciar apenas o backend:**
  ```bash
  docker compose restart backend
  ```

- **Rodar script de verificação:**
  ```bash
  ./verify_setup.sh
  ```
