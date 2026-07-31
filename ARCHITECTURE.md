# SystemOS Architecture Guide

This document explains the overall system design, directory structure, request flow, and core design patterns utilized in SystemOS.

---

## 🏗️ Layered Architecture
SystemOS follows a strict, unidirectional layered design pattern. Each layer has a single responsibility, and database details are isolated from API routes and user interfaces:

```text
       UI (React Client Side)
                 ↓
      API Route v1 (Controller)
                 ↓
  Middleware (Auth, RateLimiter, Zod validation)
                 ↓
   Domain Service (Business Logic)
                 ↓
   Repository Layer (DB Queries & Transactions)
                 ↓
   Prisma Client (ORM & MySQL Database)
```

### 1. Presentation Tier (Client)
* **Location**: `src/app/`, `src/components/`
* **Role**: React client-side pages and components. Responsible for maintaining UI state, rendering lists/grids, triggering optimistic UI updates, and fetching data from `/api/v1/` routes.
* **Rule**: No business logic (streak, percentage, or reward target calculation) or database imports may live directly inside React components. All operations must import calculations from `src/lib/clientUtils.js`.

### 2. Controller Tier (API Routes)
* **Location**: `src/app/api/v1/`
* **Role**: Next.js App Router API handlers. They receive HTTP requests, parse query parameters and JSON payloads, delegate actions to Services, and return structured JSON responses.
* **Rule**: API Route files must wrap handlers in the `withMiddleware` higher-order function, defining Zod schemas for input validation.

### 3. Middleware Tier
* **Location**: `src/lib/middleware/`
* **Role**: Handles request lifecycle operations:
  * **Trace**: Generates unique `x-trace-id` UUIDs for log correlation.
  * **Rate Limiter**: Tracks hit counts in-memory per IP, gating abusive requests.
  * **Auth**: Decodes stateless JWT cookies, verifying caller identity.
  * **Validation**: Runs Zod schemas on JSON request bodies, search queries, and route params.
  * **ErrorHandler**: Intercepts unhandled promise rejections, logs trace stacks, and outputs a standard 500 error payload.

### 4. Domain Service Tier
* **Location**: `src/lib/services/`
* **Role**: Houses core business logic (evaluating streaks, checking habit completion counts, validating reward unlocked counts, testing plan limits, and matching template overrides).

### 5. Repository Tier
* **Location**: `src/lib/repositories/`
* **Role**: The exclusive data access tier. Direct queries, updates, deletes, and multi-table transactions (rolled out via `db.$transaction`) live here.
* **Rule**: No other tier may contact the Prisma Client directly.

---

## 🔒 Security Configuration
* **Password Gating**: Passwords are encrypted using `bcryptjs` with 10 salt rounds before database insertions.
* **Stateless Tokens**: User sessions are saved in signed `jsonwebtoken` (JWT) cookies.
* **Cookie Headers**: Auth cookies use `HttpOnly` (blocking client-side document cookie access), `Secure` (forcing HTTPS transit in production), and `SameSite: Lax` (mitigating cross-site request forgery attacks).
* **CSP Headers**: Production headers are set inside `next.config.mjs` to block framing (clickjacking) and define explicit script, style, and image sources.

---

## 📊 Analytics & Caching
* **KPI Computations**: Streak calculations are written as calendar-independent UTC comparison comparisons, handling timezone rollover shifts.
* **Caching Engine**: Built-in Map memory caching wrapper in `caching.js` exposes standard `fetchOrCompute` methods, ready to hook up Redis without affecting upper business tiers.
