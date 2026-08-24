# Haven Kenya — Property & Maintenance OS

**Haven Kenya** is a property and maintenance management platform engineered with **React 19 + Tailwind CSS** on the frontend and an ultra-fast, robust **Go (1.26)** backend. Specifically tailored for Nairobi real estate operations, Haven integrates **M-Pesa rent payments**, photo-first breakage diagnostics powered by **Google Gemini AI**, instant **WhatsApp Fundi work order dispatch**, and dual portal authentication (Landlords & Residents).

---

## Key Capabilities

- **Dual Portal Role-Based Authentication**:
  - Sign in using **any Kenyan Phone Number** (`0712345678`, `+254 712 345 678`) or **Email address**.
  - **Resident Portal**: Scoped strictly to the resident's apartment lease, rent balance in KSh, M-Pesa STK push simulation, live repair ticket timeline, and estate caretaker WhatsApp contact.
  - **Landlord Operations Dashboard**: Full portfolio financial intelligence, Nairobi estate & unit management, resident directory, maintenance triage Kanban, and fundi assignments.
  - **User Registration**: Register new tenants with Nairobi property & unit assignment.

- **Authentic Kenyan Localization & Financials**:
  - Currencies formatted in **KSh (Kenyan Shillings)**.
  - Pre-seeded with authentic Nairobi properties (*Kilimani Heights*, *Westlands Green Suites*, *Kileleshwa Terraces*).
  - Integrated **M-Pesa Paybill / Till Number** workflows with instant receipt generation.
  - 1-Click **WhatsApp Dispatch** pre-populates detailed Kenyan work orders for local fundis (Plumbers, Electricians, Carpenters).

- **Google Gemini 2.5 Flash Multimodal Vision**:
  - AI vision triage inspects tenant photos (leaks, wall cracks, electrical shorts).
  - Produces severity triage, estimated repair ranges in KSh, safety warnings, and recommended fundi trades.

- **High-Performance Go Backend (`backend/`)**:
  - File-backed JSON persistence with thread-safe `sync.RWMutex` locks.
  - Auto-recalculates portfolio revenue, occupancy rates, and ticket metrics dynamically.
  - CSV export engine for maintenance tickets and resident registries.

---

## Architecture

```
haven-property/
├── backend/                  # High-performance Go 1.26 backend
│   ├── cmd/server/main.go    # HTTP Server with graceful shutdown & logging
│   ├── internal/
│   │   ├── handlers/         # REST API Handlers & Test Suite
│   │   ├── middleware/       # CORS, Logging, Recovery, JSON helpers
│   │   ├── models/           # Go domain models matching TypeScript schemas
│   │   ├── services/         # Gemini AI Vision & CSV Export services
│   │   └── storage/          # Thread-safe store, seed defaults, persistence
│   └── data/                 # JSON database persistence directory
├── src/                      # Frontend (React 19 + TypeScript + Vite)
│   ├── components/           # LoginPage, TenantDashboard, Overview, MaintenanceHub
│   ├── context/              # PropertyContext with real auth & API sync
│   ├── services/             # Gemini AI service & Go API client
│   ├── utils/                # imageCompressor (client-side canvas compression)
│   └── types.ts              # Domain type definitions
└── vite.config.ts            # Vite config with /api reverse-proxy to Go server
```

---

## Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Go** (1.22+)

### 2. Run All Tests
```bash
# Run both frontend TypeScript linting and Go unit test suite
npm run test:all
```

### 3. Start Go Backend Server
```bash
# Starts Go server on port 8080 (http://localhost:8080)
npm run server
```

### 4. Start React Frontend
```bash
# In a separate terminal (http://localhost:3000)
npm run dev
```

---

## Test Credentials (`Password: haven2026`)

| Role | Name | Email | Kenyan Phone | Assigned Unit |
| :--- | :--- | :--- | :--- | :--- |
| **Landlord** | Eleanor Wanjiku | `wanjiku@havenmgmt.co.ke` | `0722555101` / `+254 722 555 101` | Portfolio Manager |
| **Resident** | Juma Ochieng | `juma.ochieng@gmail.com` | `0712345678` / `+254 712 345 678` | Kilimani Heights, Apt 4B |
| **Resident** | Wanjiru Mwangi | `wanjiru.m@gmail.com` | `0720112233` / `+254 720 112 233` | Westlands Green Suites, Apt 2A |
| **Resident** | Fatuma Hassan | `fatuma.h@gmail.com` | `0733445566` / `+254 733 445 566` | Kileleshwa Terraces, Apt 3C |

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/stats` | Portfolio metrics in KSh |
| `GET` | `/api/auth/users` | List registered demo users |
| `POST`| `/api/auth/login` | Authenticate by Email OR Kenyan Phone |
| `POST`| `/api/auth/register` | Register new resident or landlord |
| `GET` | `/api/auth/me` | Fetch user profile by identifier |
| `POST`| `/api/tenant/mpesa/simulate` | Simulate M-Pesa STK push & issue receipt |
| `GET` | `/api/tenant/tickets` | Query tenant maintenance tickets |
| `GET` | `/api/properties` | List Nairobi properties |
| `POST`| `/api/properties` | Create a new property |
| `GET` | `/api/units` | List units (optional `?propertyId=`) |
| `GET` | `/api/tenants` | List all active tenant leases |
| `GET` | `/api/maintenance` | List all maintenance tickets |
| `POST`| `/api/maintenance` | Create a new maintenance report |
| `POST`| `/api/maintenance/:id/contractor` | Dispatch fundi with scheduled date & cost |
| `POST`| `/api/maintenance/:id/status` | Update ticket status (`New`, `Scheduled`, `Resolved`) |
| `POST`| `/api/ai/diagnose` | Run Gemini AI damage assessment |
| `GET` | `/api/export/maintenance` | Download maintenance CSV (KSh pricing) |
| `GET` | `/api/export/tenants` | Download resident registry CSV |
| `POST`| `/api/reset` | Reset database to default demo dataset |
