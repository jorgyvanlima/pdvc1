# PDVWeb C1 - API Backend Documentação

## Visão Geral

API REST moderna para gerenciamento de PDV e ERP, desenvolvida em Node.js + Express + TypeScript.

**Base URL:** `http://localhost:3001/api/v1`

## Autenticação

Todos os endpoints (exceto `/auth/*`) requerem autenticação JWT.

### Header

```
Authorization: Bearer <JWT_TOKEN>
```

### Exemplo

```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     http://localhost:3001/api/v1/products
```

## Endpoints by Module

### Auth Module

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "senha123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "admin@admin.com",
      "firstName": "Admin"
    }
  }
}
```

#### Refresh Token

```
POST /auth/refresh
Body: { "refreshToken": "eyJhbGc..." }
```

#### Logout

```
POST /auth/logout
Headers: { "Authorization": "Bearer <token>" }
```

### Products Module

#### List Products

```
GET /products?page=1&limit=25&sortBy=name&sortOrder=asc
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "001",
      "name": "X Salada",
      "price": 8.00,
      "quantity": 198.00,
      "category": { "id": 1, "name": "Geral" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 3,
    "totalPages": 1
  }
}
```

#### Get Product

```
GET /products/:id
```

#### Create Product

```
POST /products
Content-Type: application/json

{
  "code": "002",
  "name": "Hamburger",  
  "categoryId": 1,
  "price": 12.00,
  "cost": 4.50,
  "quantity": 100,
  "tax": 5,
  "taxMethod": 1
}
```

#### Update Product

```
PUT /products/:id
```

#### Delete Product

```
DELETE /products/:id
```

#### Search Products

```
GET /products/search/salada
```

### Sales Module

#### List Sales

```
GET /sales?page=1&limit=25&status=paid
```

#### Create Sale

```
POST /sales
Content-Type: application/json

{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 8.00,
      "discount": "5%"
    }
  ],
  "discount": 0,
  "tax": 0,
  "notes": "Cliente VIP"
}
```

#### Get Sale

```
GET /sales/:id
```

#### Update Sale

```
PUT /sales/:id
```

#### Add Payment

```
POST /sales/:id/payment
Content-Type: application/json

{
  "amount": 16.00,
  "paidBy": "cash",
  "note": "Pagamento à vista"
}
```

### Customers Module

#### List Customers

```
GET /customers?page=1&limit=25
```

#### Create Customer

```
POST /customers
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "11 98765-4321",
  "custom1": "CPF: 123.456.789-00",
  "address": "Rua A, 123",
  "city": "São Paulo",
  "state": "SP"
}
```

### Cash Register Module

#### Get Current Register

```
GET /cash-register

Response:
{
  "success": true,
  "data": {
    "id": 15,
    "status": "open",
    "cashInHand": 100.00,
    "openedAt": "2026-02-09T09:00:00Z",
    "user": { "id": 1, "name": "Admin" }
  }
}
```

#### Open Register

```
POST /cash-register/open
Content-Type: application/json

{
  "cashInHand": 100.00,
  "note": "Abertura de turno"
}
```

#### Close Register

```
POST /cash-register/close
Content-Type: application/json

{
  "totalCash": 250.50,
  "note": "Fechamento de turno",
  "totalCheques": 2,
  "totalCcSlips": 1
}
```

### Reports Module

#### Sales Report

```
GET /reports/sales?startDate=2026-01-01&endDate=2026-02-09&groupBy=day

Response:
{
  "success": true,
  "data": {
    "totalSales": 1500.00,
    "totalItems": 250,
    "averageTicket": 6.00,
    "byPaymentMethod": {
      "cash": 800.00,
      "cc": 500.00,
      "check": 200.00
    }
  }
}
```

#### Products Report

```
GET /reports/products?categoryId=1&includeInactive=false
```

#### Payment Methods Report

```
GET /reports/payments?startDate=2026-01-01&endDate=2026-02-09
```

### Dashboard Module

#### Dashboard Stats

```
GET /dashboard/stats

Response:
{
  "success": true,
  "data": {
    "todaySales": 250.50,
    "todayItems": 45,
    "todayCustomers": 12,
    "openRegister": true,
    "lowStockProducts": [
      { "id": 5, "name": "Produto X", "quantity": 2, "alert": 10 }
    ]
  }
}
```

#### Dashboard Analytics

```
GET /dashboard/analytics?period=day|week|month|year
```

### Users Module

#### List Users

```
GET /users?page=1&limit=25&groupId=1
```

#### Create User

```
POST /users
Content-Type: application/json

{
  "username": "joao",
  "email": "joao@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "password": "senha123",
  "groupId": 2,
  "phone": "11 98765-4321"
}
```

#### Update User

```
PUT /users/:id
```

## Error Handling

API retorna erros com status HTTP apropriado:

```json
{
  "success": false,
  "message": "Validation error",
  "error": "Email already exists",
  "timestamp": "2026-02-09T10:30:00Z"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Sucesso |
| 201  | Created - Recurso criado |
| 400  | Bad Request - Erro de validação |
| 401  | Unauthorized - Sem autenticação |
| 403  | Forbidden - Sem permissão |
| 404  | Not Found - Recurso não encontrado |
| 500  | Server Error - Erro interno |

## Rate Limiting

Implementado limite de requisições por IP:

- **Limite:** 100 requests por 15 minutos
- **Header Response:** `X-RateLimit-Remaining`

## Webhooks

A implementar no futuro para eventos como:

- Sales completed
- Register closed
- Low stock alerts
- Payment received

## Versioning

API está em versão `v1`. URLs futuras:
- `/api/v2/...` (quando houver breaking changes)

## Biblioteca de Respostas

Todas respostas seguem o padrão:

```typescript
{
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

---

Para mais informações, consulte `/docs/DATABASE.md` e `/DEVELOPMENT.md`.
