# Traffic Fine Management System

Academic project — full-stack traffic fine management system for traffic police departments.

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Axios, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT

## Quick Start

1. **Backend**: `cd backend && npm install && cp .env.example .env` — set `MONGODB_URI` and `JWT_SECRET`.
2. **Start MongoDB** (local or Atlas).
3. **Seed data**: `cd backend && node scripts/seed.js`
4. **Run backend**: `cd backend && npm run dev`
5. **Run frontend**: `cd frontend && npm install && npm run dev`
6. Open **http://localhost:3000** — login with `admin@demo.com` / `officer@demo.com` / `driver@demo.com`, password: `123456`.

See **[RUN_INSTRUCTIONS.md](./RUN_INSTRUCTIONS.md)** for full steps.

## Project Structure

| Path | Description |
|------|-------------|
| `docs/SYSTEM_DESIGN.md` | Phase 1–2: Architecture, DB design, REST API, DFD/ER diagrams, Phase 6: Security & deployment |
| `docs/SAMPLE_DATA_AND_API.md` | Phase 4: Sample MongoDB docs, cURL and Axios examples |
| `backend/` | Express API, Mongoose models, JWT + RBAC |
| `frontend/` | React SPA, dashboards (Admin, Police, Driver), Issue Fine, Pay Fine |

## Roles

- **Admin**: Full access, stats, payments list.
- **Officer**: Issue fines, manage drivers/vehicles, view own fines.
- **Driver**: View own fines, pay fines (simulated).

## Report Conversion

Sections in `docs/SYSTEM_DESIGN.md` and `docs/SAMPLE_DATA_AND_API.md` are written for direct use in a 25–30 page academic report. Use the same section numbering (Phase 1–6) and include the Mermaid diagrams by rendering them (e.g. in Word via Mermaid Live Editor or export as images).
