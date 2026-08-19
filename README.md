# Haven — Natural Property & Maintenance OS

**Haven** is a modern property and tenant maintenance management platform built with **React 19 + Tailwind CSS** on the frontend and an ultra-fast, robust **Go (1.26)** backend. It streamlines resident damage reporting through printable unit QR codes, multimodal **Google Gemini AI Vision** diagnostics, and landlord contractor dispatching.

---

## 🌟 Key Features

- 📸 **Photo-First Resident Breakage Reporting**:
  - Deep-linked apartment QR codes (`?portal=tenant-portal&property=prop-1&unit=unit-101`) pre-fill resident details.
  - Automatic **Client-Side Canvas Compression** scales smartphone photos to optimized sizes, preventing storage issues and speeding up uploads.
- 🤖 **Google Gemini 2.5 Flash Multimodal Vision**:
  - Live AI damage inspection analyzes photo evidence (e.g. leaking P-traps, damaged sliding latches, electrical faults).
  - Automatically outputs severity assessments, estimated cost ranges, safety warnings, and recommended trade contractors.
- ⚡ **High-Performance Go Backend (`backend/`)**:
  - Idiomatic Go REST API with thread-safe JSON persistence and metrics computation.
  - Endpoints for Properties, Units, Tenants, Maintenance Requests, AI Diagnostics, and Timeline tracking.
  - Automatic portfolio revenue, occupancy rate, and open issue synchronization.
- 📋 **Contractor Dispatching & Exporting**:
  - 1-Click contractor dispatch generator (SMS / Email ready text).
  - Built-in CSV export for maintenance records and tenant registries.
- 🎨 **Earth & Forest Natural Aesthetic**:
  - Clean typography (*Playfair Display* & *Plus Jakarta Sans*) with responsive Kanban & List views.

---

## 🏗️ Architecture

```
haven-property/
├── backend/                  # High-performance Go 1.26 backend
│   ├── cmd/server/main.go    # HTTP Server entrypoint with graceful shutdown
│   ├── internal/
│   │   ├── handlers/         # REST API Handlers & Test Suite
│   │   ├── middleware/       # CORS, Logging, Recovery, JSON helpers
│   │   ├── models/           # Go domain models matching TypeScript schemas
│   │   ├── services/         # Gemini AI Vision & CSV Export services
│   │   └── storage/          # Thread-safe store, auto-recalculation, persistence
│   └── data/                 # JSON database persistence directory
├── src/                      # Frontend (React 19 + TypeScript + Vite)
│   ├── components/           # DashboardOverview, MaintenanceHub, Tenants, Modals
│   ├── context/              # PropertyContext with dynamic metrics & API sync
│   ├── services/             # GeminiService (multimodal AI) & API client
│   ├── utils/                # imageCompressor (client-side canvas compression)
│   └── types.ts              # Domain type definitions
└── vite.config.ts            # Vite config with /api reverse-proxy to Go server
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Go** (1.22+)

### 2. Install & Test Backend
```bash
# Run Go unit & integration tests
npm run server:test

# Start Go backend server on port 8080
npm run server
```

### 3. Start Frontend Client
```bash
# In a separate terminal:
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/stats` | Portfolio financial & ticket metrics |
| `GET` | `/api/properties` | List all properties |
| `POST`| `/api/properties` | Create a new property |
| `GET` | `/api/units` | List units (optional `?propertyId=`) |
| `GET` | `/api/tenants` | List all active tenant leases |
| `GET` | `/api/maintenance` | List all maintenance tickets |
| `POST`| `/api/maintenance` | Create a new maintenance report |
| `POST`| `/api/maintenance/:id/contractor` | Assign technician and appointment date |
| `POST`| `/api/maintenance/:id/status` | Update ticket status (`New`, `Scheduled`, `Resolved`, etc.) |
| `POST`| `/api/ai/diagnose` | Run Gemini Vision damage assessment |
| `GET` | `/api/export/maintenance` | Download maintenance tickets as CSV |
| `GET` | `/api/export/tenants` | Download tenant registry as CSV |
| `POST`| `/api/reset` | Reset database to default demo dataset |

---

## 🧪 Testing

```bash
# Run backend tests
npm run server:test

# Run full project checks
npm run test:all
```
