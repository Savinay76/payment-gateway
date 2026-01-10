## 🗄 Database Schema Documentation
Merchants Table

| Column      | Type      | Description   |
| ----------- | --------- | ------------- |
| id          | UUID (PK) | Merchant ID   |
| name        | VARCHAR   | Merchant name |
| email       | VARCHAR   | Unique email  |
| api_key     | VARCHAR   | API key       |
| api_secret  | VARCHAR   | API secret    |
| webhook_url | TEXT      | Optional      |
| is_active   | BOOLEAN   | Active flag   |
| created_at  | TIMESTAMP | Created time  |
| updated_at  | TIMESTAMP | Updated time  |

Indexes

orders.merchant_id

Payments Table:
| Column       | Type         | Description                   |
| ------------ | ------------ | ----------------------------- |
| id           | VARCHAR (PK) | pay_xxx                       |
| order_id     | VARCHAR (FK) | References orders(id)         |
| merchant_id  | UUID (FK)    | References merchants(id)      |
| amount       | INTEGER      | Amount                        |
| method       | VARCHAR      | upi / card                    |
| status       | VARCHAR      | processing / success / failed |
| vpa          | VARCHAR      | UPI only                      |
| card_network | VARCHAR      | Card only                     |
| card_last4   | VARCHAR(4)   | Card only                     |
| error_code   | VARCHAR      | On failure                    |
| created_at   | TIMESTAMP    | Created                       |
| updated_at   | TIMESTAMP    | Updated                       |

Indexes

payments.order_id

payments.status

Entity Relationships:
Merchant (1) ──── (N) Orders
Merchant (1) ──── (N) Payments
Order    (1) ──── (N) Payments