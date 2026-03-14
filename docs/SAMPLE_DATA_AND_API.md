# Phase 4 — Sample Data & API Examples

## 1. Sample MongoDB Documents

### users
```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439011"},
  "email": "admin@demo.com",
  "password": "$2a$12$hashed...",
  "name": "Admin User",
  "role": "admin",
  "badgeId": null,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
{
  "_id": {"$oid": "507f1f77bcf86cd799439012"},
  "email": "officer@demo.com",
  "password": "$2a$12$hashed...",
  "name": "Officer John",
  "role": "officer",
  "badgeId": "OFF-001",
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
{
  "_id": {"$oid": "507f1f77bcf86cd799439013"},
  "email": "driver@demo.com",
  "password": "$2a$12$hashed...",
  "name": "Jane Driver",
  "role": "driver",
  "badgeId": null,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

### drivers
```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439021"},
  "licenseNumber": "DL01 2020 0012345",
  "name": "Jane Driver",
  "phone": "+91 9876543210",
  "email": "driver@demo.com",
  "address": "123 Main St, City",
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
{
  "_id": {"$oid": "507f1f77bcf86cd799439022"},
  "licenseNumber": "DL02 2019 0056789",
  "name": "Bob Smith",
  "phone": "+91 9123456789",
  "email": "bob@example.com",
  "address": "456 Oak Ave",
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

### vehicles
```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439031"},
  "plateNumber": "MH12 AB 1234",
  "driverId": {"$oid": "507f1f77bcf86cd799439021"},
  "make": "Maruti",
  "model": "Swift",
  "year": 2020,
  "type": "car",
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

### violations
```json
{"code": "SPD-01", "description": "Over speeding", "defaultAmount": 1000, "points": 3, "isActive": true}
{"code": "RL-01", "description": "Red light jump", "defaultAmount": 500, "points": 2, "isActive": true}
{"code": "HLM-01", "description": "Helmet not worn", "defaultAmount": 300, "points": 1, "isActive": true}
{"code": "PARK-01", "description": "No parking zone", "defaultAmount": 400, "points": 1, "isActive": true}
```

### fines
```json
{
  "_id": {"$oid": "507f1f77bcf86cd799439041"},
  "fineNumber": "TF-ABC123-XY",
  "driverId": {"$oid": "507f1f77bcf86cd799439021"},
  "vehicleId": {"$oid": "507f1f77bcf86cd799439031"},
  "violationId": {"$oid": "<violation_id>"},
  "amount": 1000,
  "issuedBy": {"$oid": "507f1f77bcf86cd799439012"},
  "status": "pending",
  "issueDate": {"$date": "2024-01-15T10:00:00.000Z"},
  "dueDate": {"$date": "2024-02-14T23:59:59.000Z"},
  "location": "Main Street",
  "notes": null,
  "createdAt": {"$date": "2024-01-15T10:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-15T10:00:00.000Z"}
}
```

---

## 2. Example API Requests (cURL)

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"123456"}'
```

### Get current user (with token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List drivers (officer/admin)
```bash
curl -X GET "http://localhost:5000/api/drivers?search=Jane&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create fine (officer/admin)
```bash
curl -X POST http://localhost:5000/api/fines \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "507f1f77bcf86cd799439021",
    "vehicleId": "507f1f77bcf86cd799439031",
    "violationId": "<violation_id>",
    "amount": 1000,
    "dueDate": "2024-02-14"
  }'
```

### Pay fine (driver/admin)
```bash
curl -X POST http://localhost:5000/api/fines/FINE_ID/pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"method":"card"}'
```

### Admin stats
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Axios Request Examples (Frontend)

```javascript
import { authAPI, finesAPI, driversAPI } from './api/endpoints';

// Login and store token
const { data } = await authAPI.login('driver@demo.com', '123456');
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// List fines (role-based: driver sees own, officer sees issued, admin sees all)
const res = await finesAPI.list({ status: 'pending', page: 1, limit: 20 });

// Get single fine
const fine = await finesAPI.get(fineId);

// Issue fine (officer/admin)
await finesAPI.create({
  driverId, vehicleId, violationId,
  amount: 1000,
  dueDate: '2024-02-14',
  location: 'Main St',
  notes: ''
});

// Pay fine (driver/admin)
await finesAPI.pay(fineId, { amount: 1000, method: 'card' });

// Search drivers
const drivers = await driversAPI.list({ search: 'Jane', page: 1, limit: 20 });
```

---

*Use the seed script (see RUN_INSTRUCTIONS.md) to populate initial users, violations, and a sample driver/vehicle so that driver@demo.com can see fines.*
