# Phase 5 — Running the Traffic Fine Management System

## Prerequisites

- **Node.js** (v18 or later)
- **MongoDB** (local installation or MongoDB Atlas connection string)
- **npm** or **yarn**

---

## 1. Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## 2. Configure Environment

### Backend
Copy the example env file and set your values:
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/traffic-fines
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=24h
```

For **MongoDB Atlas**: replace `MONGODB_URI` with your Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/traffic-fines`).

### Frontend (optional)
If the API is not on the same host, create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

With the default Vite proxy, `npm run dev` will proxy `/api` to `http://localhost:5000`, so you often don’t need this for local development.

---

## 3. Connect MongoDB

- **Local**: Start MongoDB (e.g. `mongod` or via MongoDB Compass / Windows Service).
- **Atlas**: Ensure your IP is allowed in Network Access and use the connection string in `MONGODB_URI`.

Test connection by starting the backend (step 4); you should see `MongoDB Connected: ...`.

---

## 4. Seed Sample Data (recommended)

From the **backend** folder:
```bash
node scripts/seed.js
```

This creates:
- Users: `admin@demo.com`, `officer@demo.com`, `driver@demo.com` (password: `123456`)
- Violation types (e.g. Over speeding, Red light jump)
- One driver (Jane Driver, `driver@demo.com`) and one vehicle (MH12AB1234)

After seeding, log in as officer/admin and issue a fine for the seeded driver so that `driver@demo.com` can see and pay it.

---

## 5. Run Backend

```bash
cd backend
npm run dev
```

Server runs at **http://localhost:5000**. You should see:
- `MongoDB Connected: ...`
- `Server running on port 5000`

---

## 6. Run Frontend

In a **new terminal**:
```bash
cd frontend
npm run dev
```

Frontend runs at **http://localhost:3000** (or the port Vite shows). The dev server proxies `/api` to the backend.

---

## 7. Use the Application

1. Open **http://localhost:3000** in a browser.
2. **Login** with:
   - Admin: `admin@demo.com` / `123456`
   - Officer: `officer@demo.com` / `123456`
   - Driver: `driver@demo.com` / `123456`
3. **Officer/Admin**: Issue fines from “Issue Fine”; view “Fines” and “Admin” (admin only) / “Police Dashboard” (officer).
4. **Driver**: View “My Fines” and use “Pay Now” to simulate payment.
5. **Admin**: View “Payments” and “Admin” dashboard for stats.

---

## 8. Build for Production

### Backend
- Set `NODE_ENV=production` and a strong `JWT_SECRET`.
- Run: `node server.js` or use a process manager (e.g. PM2).

### Frontend
```bash
cd frontend
npm run build
```
Serve the `dist` folder with any static host. Set `VITE_API_URL` to your production API URL before building.

---

## Quick Checklist

| Step | Command / Action |
|------|-------------------|
| 1 | `cd backend && npm install` |
| 2 | `cd frontend && npm install` |
| 3 | Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, `JWT_SECRET` |
| 4 | Start MongoDB (local or Atlas) |
| 5 | `cd backend && node scripts/seed.js` |
| 6 | `cd backend && npm run dev` |
| 7 | `cd frontend && npm run dev` (new terminal) |
| 8 | Open http://localhost:3000 and login with demo accounts |
