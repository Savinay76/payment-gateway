
## 🏗 Architecture Documentation
### System Architecture Overview
```bash
┌─────────────┐
│   Browser   │
│ (Dashboard) │
└──────┬──────┘
       │
       ▼
┌───────────────────┐
│   Frontend App    │
│  (React - :3000)  │
└────────┬──────────┘
         │ REST API
         ▼
┌──────────────────────────┐
│        Backend API       │
│   (Node.js / Express)    │
│        Port :8000        │
└───────┬─────────┬────────┘
        │         │
        │         ▼
        │   ┌─────────────┐
        │   │ PostgreSQL  │
        │   │  Database   │
        │   └─────────────┘
        │
        ▼
┌───────────────────┐
│  Checkout Page    │
│  (React - :3001)  │
└───────────────────┘
```
## Data Flow :

1. Order Creation

2. Merchant calls Create Order API

3. Backend authenticates merchant

4. Order saved in database

5. Order ID returned

## Payment Processing :

1. Customer opens checkout page

2. Selects UPI or Card

3. Payment created in processing state

4. Simulated delay

5. Payment updated to success or failed
