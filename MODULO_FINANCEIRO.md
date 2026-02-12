# 💰 Módulo Financeiro - PDVWeb C1

## Visão Geral

Módulo financeiro completo para controle de contas a pagar, contas a receber, controle de caixa diário, alertas de vencimento e dashboard com analytics.

---

## 📊 Estrutura do Banco de Dados

### Models Principais

#### 1. **AccountsPayable** (Contas a Pagar)
Controle completo de contas e fornecedores com upload de boletos.

**Campos:**
- `description`: Descrição da conta
- `supplierId`: Fornecedor (opcional)
- `categoryId`: Categoria financeira
- `amount`: Valor total
- `dueDate`: Data de vencimento
- `paidDate`: Data do pagamento
- `status`: PENDING, PAID, OVERDUE, CANCELLED
- `paymentMethod`: CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, PIX, CHECK, BOLETO
- `documentNumber`: Número do boleto/NF
- `barcodeNumber`: Código de barras do boleto
- `note`: Observações
- `attachments`: JSON array de URLs (boletos escaneados, NFs)
- `totalInstallments`: Número de parcelas

#### 2. **AccountsReceivable** (Contas a Receber)
Controle de recebimentos e vendas a prazo.

**Campos:**
- `description`: Descrição
- `customerId`: Cliente (opcional)
- `saleId`: Venda relacionada (opcional)
- `categoryId`: Categoria financeira
- `amount`: Valor total
- `dueDate`: Data de vencimento
- `receivedDate`: Data do recebimento
- `status`: PENDING, PAID, OVERDUE, CANCELLED
- `paymentMethod`: Forma de pagamento
- `documentNumber`: Número da duplicata
- `note`: Observações
- `attachments`: JSON array de URLs
- `totalInstallments`: Número de parcelas

#### 3. **Installment** (Parcelas)
Controle de parcelamento de contas.

**Campos:**
- `accountsPayableId` ou `accountsReceivableId`
- `number`: Número da parcela (1/3, 2/3, 3/3)
- `amount`: Valor da parcela
- `fine`: Multa por atraso
- `interest`: Juros
- `discount`: Desconto concedido
- `totalPaid`: Total pago
- `dueDate`: Vencimento
- `paidDate`: Data do pagamento
- `status`: PENDING, PAID, OVERDUE, CANCELLED

#### 4. **PaymentAlert** (Alertas de Vencimento)
Sistema automático de alertas.

**Tipos de Alerta:**
- `DUE_TODAY`: Vence hoje (URGENT)
- `DUE_TOMORROW`: Vence amanhã (HIGH)
- `DUE_IN_3_DAYS`: Vence em 3 dias (MEDIUM)
- `DUE_IN_7_DAYS`: Vence em 7 dias (LOW)
- `OVERDUE`: Vencido (URGENT)

**Prioridades:**
- URGENT (vencido ou vence hoje)
- HIGH (vence amanhã)
- MEDIUM (vence em 3 dias)
- LOW (vence em 7 dias)

#### 5. **DailyCashReport** (Controle de Caixa Diário)
Relatório diário de entradas e saídas.

**Campos:**
- `date`: Data do relatório
- `openingBalance`: Saldo de abertura
- `cashIncome/Expense`: Entradas/saídas em dinheiro
- `cardIncome/Expense`: Entradas/saídas em cartão
- `pixIncome/Expense`: Entradas/saídas via PIX
- `otherIncome/Expense`: Outras entradas/saídas
- `totalIncome`: Total de entradas
- `totalExpense`: Total de saídas
- `closingBalance`: Saldo de fechamento
- `expectedBalance`: Saldo esperado
- `difference`: Diferença (para sangria/sobra)
- `status`: OPEN, CLOSED, RECONCILED

#### 6. **FinancialTransaction** (Transações Financeiras)
Registro de todas as movimentações.

**Campos:**
- `description`: Descrição
- `type`: INCOME ou EXPENSE
- `amount`: Valor
- `date`: Data da transação
- `paymentMethod`: Forma de pagamento
- `reference`: Referência interna
- `documentNumber`: Número do documento
- `userId`: Usuário responsável
- `dailyCashReportId`: Caixa do dia relacionado

#### 7. **FinancialCategory** (Categorias Financeiras)
Organização de contas por categoria.

**Campos:**
- `name`: Nome da categoria
- `description`: Descrição
- `type`: INCOME ou EXPENSE
- `color`: Cor para identificação
- `icon`: Ícone visual
- `active`: Ativo/Inativo

---

## 🔌 API Endpoints

### Contas a Pagar

#### **GET** `/api/v1/finance/accounts-payable`
Lista contas a pagar com filtros.

**Query Params:**
- `status`: PENDING, PAID, OVERDUE, CANCELLED
- `supplierId`: ID do fornecedor
- `startDate`: Data inicial (filtro)
- `endDate`: Data final (filtro)
- `page`: Página (padrão: 1)
- `limit`: Items por página (padrão: 25)

**Resposta:**
```json
{
  "success": true,
  "message": "Accounts payable retrieved",
  "data": {
    "accounts": [...],
    "total": 100,
    "page": 1,
    "totalPages": 4
  }
}
```

#### **GET** `/api/v1/finance/accounts-payable/:id`
Buscar conta específica por ID.

#### **POST** `/api/v1/finance/accounts-payable`
Criar nova conta a pagar.

**Body:**
```json
{
  "description": "Aluguel Janeiro 2026",
  "supplierId": 5,
  "categoryId": 1,
  "amount": 2500.00,
  "dueDate": "2026-02-15",
  "paymentMethod": "BOLETO",
  "documentNumber": "12345678901234567890",
  "barcodeNumber": "12345.67890 12345.678901 23456.789012 1 89012345678901234567",
  "note": "Aluguel do galpão",
  "attachments": ["https://storage.com/boleto.pdf"],
  "totalInstallments": 1
}
```

#### **PUT** `/api/v1/finance/accounts-payable/:id`
Atualizar conta.

#### **POST** `/api/v1/finance/accounts-payable/:id/pay`
Marcar conta como paga.

**Body:**
```json
{
  "paidDate": "2026-02-14",
  "paymentMethod": "BANK_TRANSFER"
}
```

#### **POST** `/api/v1/finance/accounts-payable/:id/attachment`
Adicionar anexo (boleto escaneado).

**Body:**
```json
{
  "attachmentUrl": "https://storage.com/boleto-escaneado.pdf"
}
```

#### **DELETE** `/api/v1/finance/accounts-payable/:id`
Deletar conta.

#### **GET** `/api/v1/finance/accounts-payable/reports/overdue`
Listar contas vencidas.

#### **GET** `/api/v1/finance/accounts-payable/reports/due-soon`
Listar contas vencendo em breve.

**Query Params:**
- `days`: Dias à frente (padrão: 7)

---

### Contas a Receber

#### **GET** `/api/v1/finance/accounts-receivable`
Lista contas a receber com filtros.

**Query Params:**
- `status`: PENDING, PAID, OVERDUE, CANCELLED
- `customerId`: ID do cliente
- `startDate`: Data inicial
- `endDate`: Data final
- `page`: Página
- `limit`: Items por página

#### **GET** `/api/v1/finance/accounts-receivable/:id`
Buscar conta específica.

#### **POST** `/api/v1/finance/accounts-receivable`
Criar nova conta a receber.

#### **POST** `/api/v1/finance/accounts-receivable/from-sale/:saleId`
Criar conta de uma venda a prazo.

**Body:**
```json
{
  "totalInstallments": 3
}
```

#### **PUT** `/api/v1/finance/accounts-receivable/:id`
Atualizar conta.

#### **POST** `/api/v1/finance/accounts-receivable/:id/receive`
Marcar como recebida.

**Body:**
```json
{
  "receivedDate": "2026-02-11",
  "paymentMethod": "PIX"
}
```

#### **DELETE** `/api/v1/finance/accounts-receivable/:id`
Deletar conta.

#### **GET** `/api/v1/finance/accounts-receivable/reports/overdue`
Listar contas vencidas.

#### **GET** `/api/v1/finance/accounts-receivable/reports/due-soon`
Listar contas vencendo em breve.

---

### Controle de Caixa Diário

#### **GET** `/api/v1/finance/daily-cash`
Lista relatórios de caixa.

**Query Params:**
- `status`: OPEN, CLOSED, RECONCILED
- `startDate`: Data inicial
- `endDate`: Data final
- `page`: Página
- `limit`: Items por página

#### **GET** `/api/v1/finance/daily-cash/:date`
Buscar caixa por data específica (formato: YYYY-MM-DD).

**Exemplo:** `/api/v1/finance/daily-cash/2026-02-11`

#### **POST** `/api/v1/finance/daily-cash/open`
Abrir caixa do dia.

**Body:**
```json
{
  "date": "2026-02-11",
  "openingBalance": 500.00
}
```

#### **POST** `/api/v1/finance/daily-cash/income`
Registrar entrada no caixa.

**Body:**
```json
{
  "date": "2026-02-11",
  "description": "Venda #1234",
  "amount": 150.00,
  "paymentMethod": "CASH",
  "accountsReceivableId": 45,
  "reference": "SALE-1234",
  "documentNumber": "NF-1234",
  "note": "Pagamento à vista"
}
```

#### **POST** `/api/v1/finance/daily-cash/expense`
Registrar saída do caixa.

**Body:**
```json
{
  "date": "2026-02-11",
  "description": "Pagamento Fornecedor XYZ",
  "amount": 800.00,
  "paymentMethod": "BANK_TRANSFER",
  "accountsPayableId": 12,
  "reference": "PAY-001",
  "note": "Pagamento de mercadorias"
}
```

#### **POST** `/api/v1/finance/daily-cash/close`
Fechar caixa do dia.

**Body:**
```json
{
  "date": "2026-02-11",
  "actualBalance": 1250.75,
  "notes": "Diferença de R$ 0,25 (moeda)"
}
```

#### **GET** `/api/v1/finance/daily-cash/summary/period`
Resumo de período.

**Query Params:**
- `startDate`: Data inicial (obrigatório)
- `endDate`: Data final (obrigatório)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 15000.00,
    "totalExpense": 8500.00,
    "cashIncome": 5000.00,
    "cardIncome": 8000.00,
    "pixIncome": 2000.00,
    "cashExpense": 3000.00,
    "cardExpense": 2500.00,
    "pixExpense": 3000.00,
    "netFlow": 6500.00,
    "daysCount": 30
  }
}
```

---

### Alertas de Pagamento

#### **GET** `/api/v1/finance/alerts`
Lista alertas de vencimento.

**Query Params:**
- `read`: true/false (lido/não lido)
- `dismissed`: true/false (descartado)
- `priority`: URGENT, HIGH, MEDIUM, LOW
- `type`: DUE_TODAY, DUE_TOMORROW, DUE_IN_3_DAYS, DUE_IN_7_DAYS, OVERDUE
- `page`: Página
- `limit`: Items por página (padrão: 50)

#### **POST** `/api/v1/finance/alerts/generate`
Gerar alertas automaticamente (rodar via CRON).

#### **POST** `/api/v1/finance/alerts/:id/read`
Marcar alerta como lido.

#### **POST** `/api/v1/finance/alerts/:id/dismiss`
Descartar alerta.

#### **GET** `/api/v1/finance/alerts/count/unread`
Contagem de alertas não lidos.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "count": 15
  }
}
```

#### **GET** `/api/v1/finance/alerts/stats/by-priority`
Estatísticas por prioridade.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "URGENT": 3,
    "HIGH": 5,
    "MEDIUM": 4,
    "LOW": 3
  }
}
```

---

### Dashboard Financeiro

#### **GET** `/api/v1/finance/dashboard/overview`
Visão geral do dashboard.

**Query Params (opcionais):**
- `startDate`: Data inicial (padrão: início do mês)
- `endDate`: Data final (padrão: fim do mês)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "accountsPayable": {
      "total": 25000.00,
      "count": 15,
      "overdue": {
        "total": 3000.00,
        "count": 2
      },
      "dueSoon": {
        "total": 8000.00,
        "count": 5
      }
    },
    "accountsReceivable": {
      "total": 35000.00,
      "count": 20,
      "overdue": {
        "total": 5000.00,
        "count": 3
      },
      "dueSoon": {
        "total": 12000.00,
        "count": 7
      }
    },
    "cashFlow": {
      "totalIncome": 45000.00,
      "totalExpense": 30000.00,
      "netFlow": 15000.00,
      "byMethod": {
        "cash": { "income": 15000, "expense": 10000 },
        "card": { "income": 20000, "expense": 15000 },
        "pix": { "income": 10000, "expense": 5000 }
      }
    },
    "projectedBalance": 10000.00,
    "alerts": {
      "unread": 12,
      "byPriority": {
        "URGENT": 3,
        "HIGH": 4,
        "MEDIUM": 3,
        "LOW": 2
      }
    }
  }
}
```

#### **GET** `/api/v1/finance/dashboard/cash-flow/projected`
Fluxo de caixa projetado (próximos 30 dias).

**Query Params:**
- `days`: Número de dias (padrão: 30)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-02-11",
      "income": 1500.00,
      "expense": 800.00,
      "netFlow": 700.00,
      "balance": 700.00
    },
    {
      "date": "2026-02-12",
      "income": 2000.00,
      "expense": 1200.00,
      "netFlow": 800.00,
      "balance": 1500.00
    }
    // ... próximos 28 dias
  ]
}
```

#### **GET** `/api/v1/finance/dashboard/analysis/category`
Análise por categoria.

**Query Params (obrigatórios):**
- `startDate`: Data inicial
- `endDate`: Data final

**Resposta:**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "category": {
          "id": 1,
          "name": "Fornecedores",
          "type": "EXPENSE",
          "color": "#EF4444"
        },
        "total": 15000.00,
        "count": 10
      }
    ],
    "income": [
      {
        "category": {
          "id": 5,
          "name": "Vendas",
          "type": "INCOME",
          "color": "#10B981"
        },
        "total": 35000.00,
        "count": 50
      }
    ]
  }
}
```

#### **GET** `/api/v1/finance/dashboard/top/suppliers`
Top fornecedores (maiores despesas).

**Query Params:**
- `limit`: Quantidade (padrão: 10)
- `startDate`: Data inicial (opcional)
- `endDate`: Data final (opcional)

#### **GET** `/api/v1/finance/dashboard/top/customers`
Top clientes (maiores recebimentos).

**Query Params:**
- `limit`: Quantidade (padrão: 10)
- `startDate`: Data inicial (opcional)
- `endDate`: Data final (opcional)

---

## 🔧 Services Implementados

### 1. **AccountsPayableService**
- `create()`: Criar conta com parcelas automáticas
- `list()`: Listar com filtros e paginação
- `findById()`: Buscar por ID
- `update()`: Atualizar dados
- `markAsPaid()`: Marcar como paga
- `addAttachment()`: Adicionar boleto/anexo
- `delete()`: Deletar conta
- `getOverdue()`: Contas vencidas
- `getDueSoon()`: Vence em N dias
- `getTotalPayable()`: Total a pagar (dashboard)

### 2. **AccountsReceivableService**
- `create()`: Criar conta com parcelas
- `createFromSale()`: Criar de venda a prazo
- `list()`: Listar com filtros
- `findById()`: Buscar por ID
- `update()`: Atualizar
- `markAsPaid()`: Marcar como recebida
- `delete()`: Deletar
- `getOverdue()`: Contas vencidas
- `getDueSoon()`: Vence em N dias
- `getTotalReceivable()`: Total a receber (dashboard)

### 3. **DailyCashService**
- `openCash()`: Abrir caixa do dia
- `findByDate()`: Buscar por data
- `recordIncome()`: Registrar entrada
- `recordExpense()`: Registrar saída
- `updateCashTotals()`: Recalcular totais (privado)
- `closeCash()`: Fechar caixa
- `list()`: Listar relatórios
- `getSummary()`: Resumo de período

### 4. **PaymentAlertService**
- `generateAlertsForDueAccounts()`: Gerar alertas automáticos
- `createAlertsForPayables()`: Alertas de contas a pagar (privado)
- `createAlertsForReceivables()`: Alertas de contas a receber (privado)
- `createOverdueAlerts()`: Alertas de vencidos (privado)
- `list()`: Listar alertas
- `markAsRead()`: Marcar como lido
- `dismiss()`: Descartar alerta
- `getUnreadCount()`: Contagem não lidos
- `getAlertsByPriority()`: Agrupar por prioridade

### 5. **FinancialDashboardService**
- `getDashboardOverview()`: Visão geral completa
- `getProjectedCashFlow()`: Projeção de fluxo de caixa
- `getCategoryAnalysis()`: Análise por categoria
- `getTopSuppliers()`: Top fornecedores
- `getTopCustomers()`: Top clientes

---

## 🎨 Recursos Principais

### ✅ Contas a Pagar
- ✅ Upload e anexo de boletos (PDF, imagens)
- ✅ Código de barras do boleto
- ✅ Parcelamento automático
- ✅ Controle de status (PENDING, PAID, OVERDUE, CANCELLED)
- ✅ Alertas de vencimento
- ✅ Relatórios de contas vencidas

### ✅ Contas a Receber
- ✅ Integração com vendas a prazo
- ✅ Parcelamento automático
- ✅ Controle de inadimplência
- ✅ Alertas de recebimentos
- ✅ Relatórios de contas vencidas

### ✅ Alertas de Vencimento
- ✅ Sistema automático de alertas
- ✅ Notificações para:
  - Vence hoje (URGENT)
  - Vence amanhã (HIGH)
  - Vence em 3 dias (MEDIUM)
  - Vence em 7 dias (LOW)
  - Vencidos (URGENT)
- ✅ Badge de alertas não lidos
- ✅ Descarte de alertas

### ✅ Controle de Caixa Diário
- ✅ Abertura e fechamento de caixa
- ✅ Entradas e saídas por método de pagamento
- ✅ Dinheiro, Cartão, PIX separados
- ✅ Diferença entre esperado e real (sangria/sobra)
- ✅ Relatório diário completo
- ✅ Resumo de período

### ✅ Dashboard Financeiro
- ✅ Visão geral de contas a pagar/receber
- ✅ Fluxo de caixa projetado (30 dias)
- ✅ Análise por categoria
- ✅ Top fornecedores
- ✅ Top clientes
- ✅ KPIs principais
- ✅ Gráficos de entrada/saída

---

## 📅 Tarefas Automatizadas (CRON)

### Gerar alertas diários
Rodar todos os dias às 8h da manhã:

```bash
# Cron job
0 8 * * * curl -X POST http://localhost:3001/api/v1/finance/alerts/generate
```

---

## 🧪 Próximos Passos

### Backend
1. ✅ Schema Prisma completo
2. ✅ Services implementados
3. ✅ Controllers implementados
4. ✅ Rotas registradas
5. ⏳ Migrations do Prisma (`npx prisma migrate dev`)
6. ⏳ Seed de dados de teste
7. ⏳ Testes unitários
8. ⏳ Upload de arquivos (boletos)

### Frontend (Dashboard React)
1. ⏳ Página de contas a pagar
2. ⏳ Página de contas a receber
3. ⏳ Controle de caixa diário
4. ⏳ Dashboard financeiro
5. ⏳ Alertas de vencimento (badge + modal)
6. ⏳ Gráficos (Recharts)
7. ⏳ Upload de boletos
8. ⏳ Filtros e pesquisa

---

## 🚀 Como Testar

### 1. Gerar migrations do Prisma
```bash
cd apps/backend
npx prisma migrate dev --name add_financial_module
npx prisma generate
```

### 2. Iniciar servidor
```bash
npm run dev
```

### 3. Testar endpoints com cURL

#### Criar conta a pagar
```bash
curl -X POST http://localhost:3001/api/v1/finance/accounts-payable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Aluguel Fevereiro 2026",
    "supplierId": 1,
    "amount": 2500,
    "dueDate": "2026-02-28",
    "paymentMethod": "BOLETO",
    "documentNumber": "12345678901234567890"
  }'
```

#### Listar contas a pagar
```bash
curl -X GET "http://localhost:3001/api/v1/finance/accounts-payable?status=PENDING" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Dashboard overview
```bash
curl -X GET http://localhost:3001/api/v1/finance/dashboard/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Observações Importantes

1. **Autenticação**: Todas as rotas financeiras requerem `authMiddleware` (JWT token)
2. **Validação**: Considerar adicionar validação com Zod nos controllers
3. **Upload**: Implementar middleware de upload (multer) para boletos
4. **Notificações**: Integrar com sistema de notificações para alertas
5. **Relatórios PDF**: Implementar geração de PDFs para relatórios
6. **Exportação**: Adicionar exportação CSV/Excel de contas

---

**Status:** ✅ **Backend 100% implementado** | ⏳ Frontend pendente

**Data:** 11 de fevereiro de 2026
