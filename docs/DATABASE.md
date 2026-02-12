# PDVWeb C1 - Database Schema

## 📊 Visão Geral

Banco de dados MySQL 8 com schema moderno e normalizado, mantendo compatibilidade com dados legados.

**Total de Tabelas:** 20+  
**Última Versão:** 1.0.0  
**Criar Script:** `prisma/schema.prisma`

## 📋 Entity Relationship Diagram

```
Users (1) ──←── (N) Sales
         ──←── (N) Purchases
         ──←── (N) Payments
         ──←── (N) CashRegisters

Customers (1) ──←── (N) Sales
          ──←── (N) Payments
          ──←── (N) GiftCards

Products (1) ──←── (N) SaleItems
         ──←── (N) PurchaseItems
         ──←── (N) ComboItems

Categories (1) ──←── (N) Products

Suppliers (1) ──←── (N) Purchases

Sales (1) ──←── (N) SaleItems
      ──←── (N) Payments

Purchases (1) ──←── (N) PurchaseItems

SuspendedSales (1) ──←── (N) SuspendedItems
```

## 🗂️ Tabelas Principais

### Users

Cadastro de usuários do sistema.

```sql
CREATE TABLE tec_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(50),
  lastName VARCHAR(50),
  phone VARCHAR(20),
  avatar VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  twoFactorEnabled BOOLEAN DEFAULT FALSE,
  groupId INT NOT NULL,
  lastLogin DATETIME,
  lastIp VARCHAR(45),
  preferences JSON,
  apiToken VARCHAR(255) UNIQUE,
  lastActivityAt DATETIME,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (groupId) REFERENCES tec_groups(id),
  INDEX idx_email (email),
  INDEX idx_username (username)
);
```

**Relacionamentos:**
- 1 User ─→ N Sales
- 1 User ─→ N Purchases
- 1 User ─→ N Payments
- 1 User ─→ N CashRegisters
- 1 User ─→ N AuditLogs

### Products

Catálogo de produtos.

```sql
CREATE TABLE tec_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  categoryId INT NOT NULL,
  price DECIMAL(25,2) NOT NULL,
  cost DECIMAL(25,2),
  quantity DECIMAL(15,2) DEFAULT 0,
  alertQuantity DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2),
  taxMethod INT DEFAULT 1,  -- 1: included, 0: excluded
  barcode VARCHAR(255) UNIQUE,
  barcodeSymbology VARCHAR(20) DEFAULT 'code39',
  type VARCHAR(20) DEFAULT 'standard',  -- standard, combo, service
  isComposite BOOLEAN DEFAULT FALSE,
  image VARCHAR(255) DEFAULT 'no_image.png',
  details TEXT,
  supplierCode VARCHAR(50),
  gtin VARCHAR(14),
  active BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (categoryId) REFERENCES tec_categories(id),
  INDEX idx_code (code),
  INDEX idx_name (name),
  INDEX idx_barcode (barcode),
  FULLTEXT INDEX ft_search (name, code)
);
```

**Campos Especiais:**
- `quantity`: Estoque atual (atualizado por compras/vendas)
- `alertQuantity`: Limite mínimo para alertas
- `taxMethod`: 1 = incluído no preço, 0 = adicional
- `isComposite`: TRUE para combos/kits

### Sales

Registro de vendas/notas fiscais.

```sql
CREATE TABLE tec_sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATETIME NOT NULL,
  customerId INT NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  total DECIMAL(25,2) NOT NULL,
  productDiscount DECIMAL(25,2) DEFAULT 0,
  orderDiscount DECIMAL(25,2) DEFAULT 0,
  totalDiscount DECIMAL(25,2) DEFAULT 0,
  productTax DECIMAL(25,2) DEFAULT 0,
  orderTax DECIMAL(25,2) DEFAULT 0,
  totalTax DECIMAL(25,2) DEFAULT 0,
  grandTotal DECIMAL(25,2) NOT NULL,
  totalItems INT,
  totalQuantity DECIMAL(15,2),
  paid DECIMAL(25,2) DEFAULT 0,
  rounding DECIMAL(8,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',  -- draft, finalized, paid, cancelled
  note TEXT,
  receiptNumber VARCHAR(50) UNIQUE,
  fiscalReference VARCHAR(100),
  signedAt DATETIME,
  createdBy INT NOT NULL,
  updatedBy INT,
  updatedAt DATETIME,
  
  FOREIGN KEY (customerId) REFERENCES tec_customers(id),
  FOREIGN KEY (createdBy) REFERENCES tec_users(id),
  INDEX idx_date (date),
  INDEX idx_status (status),
  INDEX idx_customer (customerId)
);
```

**Campos de Cálculo:**
- `total`: Soma dos itens sem impostos
- `totalTax`: Impostos totais
- `grandTotal`: `total + totalTax - totalDiscount`
- `paid`: Valor já pagament (0 para draft)

### SaleItems

Itens de cada venda.

```sql
CREATE TABLE tec_sale_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  saleId INT NOT NULL,
  productId INT NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unitPrice DECIMAL(25,2) NOT NULL,
  netUnitPrice DECIMAL(25,2) NOT NULL,
  realUnitPrice DECIMAL(25,2),
  discount VARCHAR(20),  -- "10%" ou "5.00"
  itemDiscount DECIMAL(25,2) DEFAULT 0,
  tax DECIMAL(10,2),
  itemTax DECIMAL(25,2) DEFAULT 0,
  subtotal DECIMAL(25,2) NOT NULL,
  cost DECIMAL(25,2) DEFAULT 0,
  
  FOREIGN KEY (saleId) REFERENCES tec_sales(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES tec_products(id)
);
```

### Customers

Cadastro de clientes.

```sql
CREATE TABLE tec_customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  custom1 VARCHAR(255),  -- Dados customizados (CPF, etc)
  custom2 VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zipCode VARCHAR(10),
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_name (name),
  INDEX idx_custom1 (custom1),
  FULLTEXT INDEX ft_search (name, email)
);
```

### Payments

Registro de pagamentos.

```sql
CREATE TABLE tec_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  saleId INT,
  customerId INT,
  paidBy VARCHAR(50) NOT NULL,  -- cash, CC, check, gift_card, transfer
  amount DECIMAL(25,2) NOT NULL,
  ccNo VARCHAR(20),  -- Últimos 4 dígitos apenas em prod
  ccHolder VARCHAR(100),
  ccMonth VARCHAR(2),
  ccYear VARCHAR(4),
  ccType VARCHAR(20),  -- Visa, MasterCard, etc
  checkNo VARCHAR(20),
  gcNo VARCHAR(20),  -- Gift card number
  currency VARCHAR(3) DEFAULT 'BRL',
  reference VARCHAR(50),
  transactionId VARCHAR(100),
  note TEXT,
  attachment VARCHAR(255),
  posPaid DECIMAL(25,2) DEFAULT 0,
  posBalance DECIMAL(25,2) DEFAULT 0,
  createdBy INT NOT NULL,
  updatedBy INT,
  updatedAt DATETIME,
  
  FOREIGN KEY (saleId) REFERENCES tec_sales(id) ON DELETE SET NULL,
  FOREIGN KEY (customerId) REFERENCES tec_customers(id) ON DELETE SET NULL,
  FOREIGN KEY (createdBy) REFERENCES tec_users(id),
  INDEX idx_date (date),
  INDEX idx_saleId (saleId),
  INDEX idx_paidBy (paidBy)
);
```

### CashRegister

Turnos de caixa/registros.

```sql
CREATE TABLE tec_registers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATETIME NOT NULL,
  userId INT NOT NULL,
  cashInHand DECIMAL(25,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'open',  -- open, closed
  totalCash DECIMAL(25,2),
  totalCheques INT,
  totalCcSlips INT,
  totalCashSubmitted DECIMAL(25,2),
  totalChequesSubmitted INT,
  totalCcSlipsSubmitted INT,
  note TEXT,
  transferOpenedBills VARCHAR(50),
  closedAt DATETIME,
  closedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES tec_users(id),
  INDEX idx_date (date),
  INDEX idx_status (status)
);
```

### Purchases

Compras de produtos.

```sql
CREATE TABLE tec_purchases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reference VARCHAR(50) UNIQUE NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  supplierId INT,
  total DECIMAL(25,2) NOT NULL,
  note TEXT,
  attachment VARCHAR(255),
  received BOOLEAN DEFAULT FALSE,
  createdBy INT NOT NULL,
  
  FOREIGN KEY (supplierId) REFERENCES tec_suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (createdBy) REFERENCES tec_users(id),
  INDEX idx_date (date),
  INDEX idx_reference (reference)
);
```

### Settings

Configurações globais do sistema.

```sql
CREATE TABLE tec_settings (
  id INT PRIMARY KEY DEFAULT 1,
  siteName VARCHAR(255) DEFAULT 'PDVWeb C1',
  logo VARCHAR(255),
  tel VARCHAR(20),
  email VARCHAR(100),
  dateFormat VARCHAR(20) DEFAULT 'dd/MM/yyyy',
  timeFormat VARCHAR(20) DEFAULT 'HH:mm:ss',
  timeZone VARCHAR(255) DEFAULT 'America/Sao_Paulo',
  currencyPrefix VARCHAR(3) DEFAULT 'R$',
  decimals INT DEFAULT 2,
  thousandsSep VARCHAR(2) DEFAULT ',',
  decimalsSep VARCHAR(2) DEFAULT '.',
  defaultCustomerId INT,
  defaultCategoryId INT,
  enableCaptcha BOOLEAN DEFAULT TRUE,
  enableStripe BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'pt-BR',
  theme VARCHAR(20) DEFAULT 'light',
  maintenanceMode BOOLEAN DEFAULT FALSE,
  version VARCHAR(10) DEFAULT '1.0.0',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔍 Índices Importantes

```sql
-- Busca rápida
CREATE FULLTEXT INDEX ft_products_search ON tec_products(name, code);
CREATE FULLTEXT INDEX ft_customers_search ON tec_customers(name, email);

-- Performance de datas
CREATE INDEX idx_sales_date ON tec_sales(date);
CREATE INDEX idx_payments_date ON tec_payments(date);

-- Foreign keys com filtro
CREATE INDEX idx_sales_customer ON tec_sales(customerId);
CREATE INDEX idx_sales_user ON tec_sales(createdBy);
```

## 📊 Statisticas e Views

```sql
-- View: Vendas por dia
CREATE VIEW sales_daily AS
SELECT 
  DATE(date) as date,
  COUNT(*) as total_sales,
  SUM(grandTotal) as total_amount,
  AVG(grandTotal) as avg_ticket
FROM tec_sales
WHERE status IN ('finalized', 'paid')
GROUP BY DATE(date);

-- View: Estoque baixo
CREATE VIEW low_stock_products AS
SELECT 
  id, name, code, quantity, alertQuantity
FROM tec_products
WHERE quantity <= alertQuantity AND active = TRUE;
```

## 🔐 Segurança

### Dados Sensíveis

```sql
-- Nunca armazenar senha em texto:
-- ✅ Usar BCRYPT no backend

-- Cartão de crédito - armazenar apenas últimos 4 dígitos:
UPDATE tec_payments 
SET ccNo = CONCAT('****-', RIGHT(ccNo, 4))
WHERE ccNo IS NOT NULL;
```

## 🔄 Migrações

Usar Prisma Migrations:

```bash
# Criar nova migração
npx prisma migrate dev --name add_new_field

# Deploy em produção
npx prisma migrate deploy

# Verificar status
npx prisma migrate status
```

## 📈 Performance

### Query Optimization

```sql
-- Use índices
EXPLAIN SELECT * FROM tec_products WHERE code = '001';

-- Evite subqueries desnecessárias
-- Evite SELECT * (especifique colunas)
-- Use LIMIT para grandes resultado

-- Particionamento por DATA (ano)
ALTER TABLE tec_sales PARTITION BY RANGE(YEAR(date)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION pMAX VALUES LESS THAN MAXVALUE
);
```

## 🔗 Relacionamentos Summary

| Tabela | Relaciona | Via |
|--------|-----------|-----|
| Sales | Users | createdBy |
| SaleItems | Products | productId |
| Payments | Sales | saleId |
| CashRegister | Users | userId |
| Purchases | Suppliers | supplierId |

---

**Última revisão:** 9 de fevereiro de 2026  
**Compatível com:** Prisma ORM v5.7+
