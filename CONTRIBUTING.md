# Contributing to SystemOS

Thank you for contributing to SystemOS! This document outlines coding standards, local development configurations, testing workflows, and deployment procedures.

---

## 🛠️ Local Environment Setup

### 1. Requirements
* **Node.js**: v18.0.0 or higher
* **MySQL**: v8.0 or higher

### 2. Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure local environment variables inside a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/habit_tracker"
   JWT_SECRET="your-jwt-secure-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
3. Initialize the database schema and generate the Prisma Client:
   ```bash
   npx prisma db push
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing Workflow
Every business logic change or repository addition must verify calculations by running the automated unit test suite:
```bash
npm run test
```
Make sure all tests pass before making pull requests. If you write new streak or unlock ratio code, append assertion coverage inside the `scripts/test-business-logic.mjs` test script.

---

## 💅 Styling and Design Guidelines
* **Pure CSS Modules**: Write style variables inside `src/app/globals.css` and use `.module.css` local class definitions. Avoid utility-first overrides like Tailwind unless explicitly instructed.
* **Japandi Minimalist Palette**: Keep backdrops calm and Warm Stone (`#f5f4f0` / `#0b111e`) with Outfit typography (forced sans-serif).
* **Keyboard Accessibility**: Ensure focus borders are visible on input fields. Include semantic tags like `<header>`, `<main>`, and `aria-label` tags on interactive items.
