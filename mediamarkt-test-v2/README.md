# 🛒 Marketplace Microservices (Orders & Invoices)

This project implements a simplified e-commerce marketplace using **microservices**, designed for a technical challenge. It includes:

- ✅ Two NestJS microservices: `order-service` and `invoice-service`
- ✅ MongoDB as a shared NoSQL database
- ✅ RabbitMQ for asynchronous messaging
- ✅ JWT Authentication with seller & customer roles
- ✅ Docker Compose for local development
- ✅ Seeding script to create users

---

## 📦 Services Overview

| Service         | Port   | Description                             |
|----------------|--------|-----------------------------------------|
| Order Service   | 3000   | Manages order lifecycle                 |
| Invoice Service | 3001   | Handles invoice upload & shipment       |
| MongoDB         | 27017  | Shared NoSQL database                   |
| RabbitMQ        | 5672   | Broker for async communication          |
| RabbitMQ UI     | 15672  | Management dashboard for queues/events  |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/marketplace-microservices.git
cd marketplace-microservices
```

### 2. Start all services with Docker Compose

```bash
docker compose up --build
```

This command builds and starts:
- `order-service` (http://localhost:3001)
- `invoice-service` (http://localhost:3002)
- MongoDB
- RabbitMQ (with management UI at http://localhost:15672)

---

### 3. Seed MongoDB with initial users

Once containers are running, run:

```bash
docker compose exec order-service npx ts-node src/scripts/seed-users.ts
```

You should see:

```
Seeded users
```

### 👤 Seeded Users

| Role     | Email               | Password     |
|----------|---------------------|--------------|
| Seller   | seller@example.com  | sellerpass   |
| Customer | customer@example.com| customerpass |

---

## 🔐 Authentication

### Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "seller@example.com",
  "password": "sellerpass"
}
```

**Response:**

```json
{
  "access_token": "<JWT_TOKEN>"
}
```

Use this token in the `Authorization` header for all protected routes:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📬 API Endpoints

### 🛍️ Orders (Customer only)

#### Create Order

```http
POST /orders
```

**Header:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "productId": "abc123",
  "price": 100,
  "quantity": 2,
  "customerId": "c1",
  "sellerId": "s1"
}
```

#### List My Orders

```http
GET /orders
Authorization: Bearer <token>
```

#### Get Order Details

```http
GET /orders/:orderId
Authorization: Bearer <token>
```

#### Update Order Status (Unsecured for simplicity)

```http
PATCH /orders/:orderId/status
```

**Body:**

```json
{
  "status": "SHIPPED"
}
```

---

### 🧾 Invoices (Seller only)

#### Upload Invoice

```http
POST /invoices/:orderId/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF file to upload

#### List Invoices

```http
GET /invoices
Authorization: Bearer <token>
```

#### Get Invoice Details

```http
GET /invoices/:invoiceId
Authorization: Bearer <token>
```

---

## 🐇 RabbitMQ

RabbitMQ is used for asynchronous event handling between microservices.

- **Event:** `ORDER_SHIPPED`
- **Consumer:** Invoice service listens and marks the invoice as sent.

You can inspect the queues and messages using the management UI:

```
http://localhost:15672
Username: guest
Password: guest
```

---

## ⚙️ Environment Variables

Both services use the following `.env` configuration (handled by Docker Compose):

```env
# Shared Mongo
MONGO_URI=mongodb://root:example@mongodb:27017/marketplace?authSource=admin

# JWT
JWT_SECRET=secret

# RabbitMQ
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
```

---

## 🧪 Running Without Docker (Optional)

You can also run each service locally:

```bash
# Order service
cd order-service
npm install
npm run start:dev

# Invoice service
cd invoice-service
npm install
npm run start:dev
```

Make sure MongoDB and RabbitMQ are running locally, or adjust `.env` values accordingly.

Then run:

```bash
npx ts-node src/scripts/seed-users.ts
```

To create test users in MongoDB.

---

## ✅ Features

- Role-based access control (`@RolesGuard`)
- JWT authentication
- Invoice upload with PDF validation
- Event-based messaging with RabbitMQ
- MongoDB shared across microservices
- Dockerized for local development
- Users scoped to their own data (partially)
- Github Actions CI (not tested but included)

