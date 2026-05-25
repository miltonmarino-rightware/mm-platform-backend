
# Money Makers Academy Backend

Node.js / Fastify / TypeScript backend for the Money Makers Academy platform. This backend acts as a thin layer over Supabase, providing specialized endpoints for trading journals, AI chat, signals, and course management.

## Stack

- **Node.js 20+**
- **TypeScript** (Strict Mode)
- **Fastify v5**
- **Supabase** (Auth & Database)
- **Gemini AI** (via Google Generative AI)
- **Zod** (Validation)
- **Pino** (Logging)

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in the following:
   - `SUPABASE_URL`: Your Supabase project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep this secret!).
   - `SUPABASE_JWT_SECRET`: Your Supabase JWT secret for token validation.
   - `GEMINI_API_KEY`: Your Google Gemini API key.

3. **Run in development mode:**
   ```bash
   pnpm dev
   ```

4. **Build and start in production:**
   ```bash
   pnpm build
   pnpm start
   ```

## Deployment

This project is configured for direct deployment to **Railway** using the provided `railway.json`. It uses Nixpacks to automatically detect the Node.js environment.

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

## Available Endpoints

### Public
- `GET /health`: System health check.
- `GET /api/version`: Current API version.

### Authenticated (User)
- `POST /api/auth/me`: Get current user profile.
- `GET /api/profile`: Get profile details.
- `PUT /api/profile`: Update profile.
- `GET /api/trades`: List user trades.
- `POST /api/trades`: Create a new trade.
- `GET /api/trades/stats`: Get trading statistics.
- `GET /api/signals`: List published signals.
- `POST /api/chat/sessions`: Create AI chat session.
- `POST /api/chat/sessions/:id/message`: Send message to Gemini.
- `GET /api/courses`: List available courses.

### Admin/Mentor
- `POST /api/admin/signals`: Create a signal.
- `PATCH /api/admin/signals/:id/state`: Update signal status.
- `POST /api/admin/courses`: Create a course.

**Known Issues:**
- Gemini model names might vary by region/account. Currently using `gemini-2.0-flash`.
- Payment system is a stub as per instructions.

**Credits Spent:** ~180 / 300
