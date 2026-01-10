## 📘 API Documentation
### Base URL
```bash
http://localhost:8000
```
🔍 Health Check
```bash
GET /health
```
Description
Checks application and database health.

Request
```bash
GET /health
```

 Response – 200
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```
### 🔐 Authentication

All protected endpoints require:

X-Api-Key: <merchant_api_key>
X-Api-Secret: <merchant_api_secret>


### If invalid:

401 Response
```json 
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "description": "Invalid API credentials"
  }
}
```
📦 Orders API
Create Order
POST /api/v1/orders

Request Headers

X-Api-Key
X-Api-Secret
Content-Type: application/json


Request Body
```json
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "customer_name": "John Doe"
  }
}
```

Response – 201
```json
{
  "id": "order_NXhj67fGH2jk9mPq",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "customer_name": "John Doe"
  },
  "status": "created",
  "created_at": "2024-01-15T10:30:00Z"
}
```
Get Order
GET /api/v1/orders/{order_id}

Response – 200
```json
{
  "id": "order_NXhj67fGH2jk9mPq",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "currency": "INR",
  "status": "created",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```
💳 Payments API
Create Payment (UPI)
POST /api/v1/payments

Request Body
```json
{
  "order_id": "order_NXhj67fGH2jk9mPq",
  "method": "upi",
  "vpa": "user@paytm"
}

```
Response – 201
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "method": "upi",
  "vpa": "user@paytm",
  "status": "processing",
  "created_at": "2024-01-15T10:31:00Z"
}
```
Create Payment (Card)

Request Body
```json
{
  "order_id": "order_NXhj67fGH2jk9mPq",
  "method": "card",
  "card": {
    "number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cvv": "123",
    "holder_name": "John Doe"
  }
}
```


Response – 201
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "method": "card",
  "card_network": "visa",
  "card_last4": "1111",
  "status": "processing"
}
```
### Get Payment
```bash
GET /api/v1/payments/{payment_id}
```
Response – 200
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "status": "success",
  "created_at": "2024-01-15T10:31:00Z",
  "updated_at": "2024-01-15T10:31:10Z"
}
```

### 🌐 Public Checkout APIs
```bash
GET /api/v1/orders/{order_id}/public
```
Returns order details without authentication.
```bash
POST /api/v1/payments/public
```

Creates payment from checkout page (no auth).

### 🧪 Test Endpoint
```bash
GET /api/v1/test/merchant
```
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "api_key": "key_test_abc123",
  "seeded": true
}
```