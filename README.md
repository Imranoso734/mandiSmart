# MandiSmart Backend

MandiSmart ek multi-tenant Mandi Management aur Ledger SaaS backend hai jo Pakistan ki Urdu-speaking mandi market ke liye design kiya gaya hai. Ye system Arrti (owner) aur Mushi (operator) dono ke liye bana hai aur customer khata, supplier consignments, sales, payments, expenses, aur Urdu-friendly reporting ko manage karta hai.

## Core Purpose

MandiSmart ka goal manual mandi register ko digital system mein convert karna hai.

System in cheezon ko handle karta hai:
- kisan ya supplier se aane wala truck / consignment record
- customer ko maal ki sale entry
- customer payment aur running khata
- labour, vehicle rent, commission aur doosre expenses
- consignment close hone par supplier settlement summary
- daily sales aur ledger reporting
- multi-tenant data isolation through `tenantId`

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- Docker
- JSON Schema + `json-schema-to-ts`

## Multi-Tenant Design

Har Arrti ka data alag tenant scope mein store hota hai.

- shared database use hota hai
- har business record `tenantId` ke through isolate hota hai
- same phone number different tenants mein allowed hai
- auth ke baad requests tenant context ke saath run hoti hain

## Roles

### OWNER

- tenant create kar sakta hai
- tenant profile update kar sakta hai
- operators create/update/delete kar sakta hai
- poora apna mandi data dekh sakta hai
- reports aur settlement dekh sakta hai

### OPERATOR

- customer, supplier, consignment, sale, payment, expense record kar sakta hai
- field ya mandi floor par operational entries kar sakta hai
- owner ke tenant scope ke andar kaam karta hai

## Main Business Modules

- `auth`
- `tenant`
- `users`
- `customers`
- `suppliers`
- `consignments`
- `sales`
- `payments`
- `expenses`
- `reporting`

## Ledger Logic

System ke andar customer khata simple ledger rule follow karta hai:

- Sale = debit
- Payment = credit
- Running balance automatically calculate hota hai
- Negative balance allow hai agar customer advance de

## Consignment Logic

- Supplier truck ke zariye maal bhejta hai
- Ek consignment ke andar multiple items ho sakte hain
- Har consignment `OPEN` ya `CLOSED` hota hai
- Sale items consignment items ke against record hoti hain
- Close ke waqt supplier settlement summary nikali ja sakti hai

## Expenses

Supported expense types:
- `LABOUR`
- `VEHICLE_RENT`
- `COMMISSION`
- `OTHER`

Expenses optionally kisi specific consignment se link ho sakte hain.

## Reports

Current reporting endpoints:
- daily sales report
- customer ledger report
- consignment summary report
- supplier settlement report

Reports API JSON return karti hai aur frontend ya print layer Urdu layout generate kar sakti hai.

## API Base URL

```text
/api/v1
```

## Auth Flow

### 1. Register Owner

`POST /api/v1/auth/register-owner`

Ye endpoint ek naya tenant aur us tenant ka owner user create karta hai.

### 2. Login

`POST /api/v1/auth/login`

Ye tenant slug + email + password ke basis par token return karta hai.

### 3. Authenticated Requests

Protected endpoints par header bhejna hota hai:

```text
Authorization: Bearer <token>
```

## Quick API Overview

### Health
- `GET /api/v1/health-check`

### Auth
- `POST /api/v1/auth/register-owner`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Tenant
- `GET /api/v1/tenant/me`
- `PATCH /api/v1/tenant/me`

### Users
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `POST /api/v1/users`
- `PUT /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

### Customers
- `GET /api/v1/customers`
- `GET /api/v1/customers/:id`
- `POST /api/v1/customers`
- `PUT /api/v1/customers/:id`
- `DELETE /api/v1/customers/:id`

### Suppliers
- `GET /api/v1/suppliers`
- `GET /api/v1/suppliers/:id`
- `POST /api/v1/suppliers`
- `PUT /api/v1/suppliers/:id`
- `DELETE /api/v1/suppliers/:id`

### Consignments
- `GET /api/v1/consignments`
- `GET /api/v1/consignments/:id`
- `POST /api/v1/consignments`
- `PUT /api/v1/consignments/:id`
- `DELETE /api/v1/consignments/:id`
- `POST /api/v1/consignments/:id/close`

### Sales
- `GET /api/v1/sales`
- `GET /api/v1/sales/:id`
- `POST /api/v1/sales`
- `PUT /api/v1/sales/:id`
- `DELETE /api/v1/sales/:id`

### Payments
- `GET /api/v1/payments`
- `GET /api/v1/payments/:id`
- `POST /api/v1/payments`
- `PUT /api/v1/payments/:id`
- `DELETE /api/v1/payments/:id`

### Expenses
- `GET /api/v1/expenses`
- `GET /api/v1/expenses/:id`
- `POST /api/v1/expenses`
- `PUT /api/v1/expenses/:id`
- `DELETE /api/v1/expenses/:id`

### Reports
- `GET /api/v1/reports/daily-sales`
- `GET /api/v1/reports/customer-ledger/:id`
- `GET /api/v1/reports/consignment-summary/:id`
- `GET /api/v1/reports/supplier-settlement/:id`

## Example Request Payloads

### Register Owner

```json
{
  "tenantName": "MandiSmart Demo",
  "tenantSlug": "mandismart-demo",
  "tenantPhone": "03001234567",
  "tenantAddress": "Sabzi Mandi Lahore",
  "ownerName": "Imran",
  "ownerEmail": "owner@example.com",
  "ownerPhone": "03001234567",
  "password": "StrongPass123"
}
```

### Create Customer

```json
{
  "name": "Sajid",
  "phone": "03001112222",
  "address": "Badami Bagh",
  "notes": "Roz ka customer",
  "isActive": true
}
```

### Create Supplier

```json
{
  "name": "Ahmad Kisan",
  "phone": "03003334444",
  "address": "Okara",
  "notes": "Aloo supplier",
  "isActive": true
}
```

### Create Consignment

```json
{
  "supplierId": 1,
  "vehicleNumber": "LES-1234",
  "driverName": "Rasheed",
  "driverPhone": "03005556666",
  "arrivalDate": "2026-03-25T05:30:00.000Z",
  "notes": "Subah ka truck",
  "commissionType": "PERCENTAGE",
  "commissionValue": 6,
  "items": [
    {
      "productNameUrdu": "آلو",
      "productNameRoman": "Aloo",
      "unit": "kg",
      "quantityReceived": 1000,
      "baseRate": 85
    }
  ]
}
```

### Create Sale

```json
{
  "customerId": 1,
  "saleDate": "2026-03-25T09:00:00.000Z",
  "notes": "Subah ki sale",
  "items": [
    {
      "consignmentId": 1,
      "consignmentItemId": 1,
      "productNameUrdu": "آلو",
      "quantity": 100,
      "rate": 105
    }
  ]
}
```

### Create Payment

```json
{
  "customerId": 1,
  "amount": 5000,
  "paymentDate": "2026-03-25T11:00:00.000Z",
  "method": "CASH",
  "reference": "cash receipt",
  "notes": "part payment"
}
```

### Create Expense

```json
{
  "consignmentId": 1,
  "expenseType": "LABOUR",
  "titleUrdu": "مزدوری",
  "amount": 2500,
  "expenseDate": "2026-03-25T12:00:00.000Z",
  "notes": "truck utarai"
}
```
## Environment Variables

```env
DATABASE_URI="postgresql://postgres:postgres@localhost:5433/mandismart?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
HOST=0.0.0.0
```

## Docker Database

PostgreSQL Docker ke through run hota hai.

```bash
docker compose up -d db
```

Current local setup host port `5433` use karta hai.

## Local Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run build
```

## Run in Development

```bash
npm run start:dev
```

## Project Structure

```text
src/
  app/
    modules/
    routers.ts
  core/
    database/
    helpers/
    server/
prisma/
  schema.prisma
postman/
docker-compose.yml
README.md
```

## Documentation Files

Detailed API explanation ke liye ye file bhi check karein:

- `MANDISMART_API_DETAILS.txt`

