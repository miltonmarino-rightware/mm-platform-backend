
# Money Makers Academy Backend

Node.js / Fastify / TypeScript backend for the Money Makers Academy platform.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in the values.

3. Run in development mode:
   ```bash
   pnpm dev
   ```

4. Build and start in production:
   ```bash
   pnpm build
   pnpm start
   ```

## Phase Status

| Phase | Name                  | Priority | Status   | Commit  |
| ----- | --------------------- | -------- | -------- | ------- |
| 1     | Setup base            | CRÍTICA  | ✅ done   | f97d691 |
| 2     | Auth + Profile        | CRÍTICA  | ✅ done   | 9bfaf35 |
| 3     | Trades                | CRÍTICA  | ✅ done   | 6472d9d |
| 4     | Signals               | CRÍTICA  | ✅ done   | bd0e435 |
| 5     | AI Chat               | CRÍTICA  | ✅ done   | 9dbaac7 |
| 6     | Courses + Lessons     | CRÍTICA  | ✅ done   | 1f0bd6f |
| 7     | Bookings              | MÉDIA    | ✅ done   | 8317759 |
| 8     | Broadcasts            | MÉDIA    | ✅ done   | 8317759 |
| 9     | Groups + Messages     | MÉDIA    | ✅ done   | 8317759 |
| 10    | Museum + Events       | MÉDIA    | ✅ done   | 8317759 |
| 11    | Payments (Stub)       | MÉDIA    | ✅ done   | 8317759 |

**Known Issues:**
- Gemini API key validated but model names might need adjustment based on specific account permissions.

**Credits Spent:** ~160 / 300
