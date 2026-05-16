# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: MicroMentor

A knowledge marketplace that connects users with verified expert professionals for short, high-impact consultation sessions. The platform handles: expert discovery, booking requests, expert approval, payment processing (SEPay), video consultation (Agora), reviews, and refund management.

Three roles: **User** (seeks advice), **Expert** (approved user who provides advice), **Administrator** (manages platform).

The UI language is **Vietnamese**. All user-facing labels, constants, and copy are in Vietnamese.

---

## Repository Layout

```
TMDT/
├── backend/
│   ├── common/        # Abstract base models (UUID PK, timestamps, soft delete)
│   ├── users/         # User model, Firebase auth backend, custom manager
│   ├── experts/       # Expert profile, AvailabilitySlot
│   ├── bookings/      # Booking, BookingSlot (15-min slot bridge table)
│   ├── payments/      # Payment (SEPay), Payout
│   ├── reviews/       # Review (1–5 stars, post-session)
│   ├── notifications/ # Notification model
│   ├── audit_logs/    # AuditLog — immutable trail of all state transitions
│   ├── files/         # UploadedFile (Azure Blob Storage)
│   ├── admin_panel/   # Admin-only views
│   ├── config/        # Django settings (base/local/production), urls, wsgi/asgi
│   └── manage.py
├── frontend/
│   ├── app/           # Next.js App Router pages (see Frontend Architecture)
│   ├── components/    # Reusable React components (booking/, common/, layout/, payment/, ui/)
│   ├── constants/     # App-wide constants (categories, nav links, price ranges, durations)
│   ├── hooks/         # React hooks (useAuth)
│   ├── lib/           # Utilities (firebase.ts, firebase-auth.ts, utils.ts)
│   ├── store/         # Redux Toolkit (authSlice, store hooks)
│   └── types/         # TypeScript domain types and enums (single source of truth)
├── api/               # OpenAPI YAML spec
├── database/
│   ├── 01-init.sql    # Schema (Azure SQL Server / T-SQL)
│   └── 02-seed.sql    # Seed data
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yaml
```

---

## Development Commands

### Backend

```powershell
# Activate venv
backend\.venv\Scripts\Activate.ps1

# Run dev server (port 8000)
python backend/manage.py runserver

# Migrations
python backend/manage.py makemigrations
python backend/manage.py migrate

# Create superuser
python backend/manage.py createsuperuser
```

### Frontend

```powershell
cd frontend
npm run dev           # dev server (port 3000)
npm run build         # production build
npm run lint          # ESLint
npm test              # Jest unit tests
npm run test:coverage # Jest with coverage
```

---

## Backend Architecture

**Multiple Django apps** — each domain has its own app registered in `INSTALLED_APPS` and mounted under `/api/v1/` in `config/urls.py`. Apps: `common`, `users`, `experts`, `bookings`, `payments`, `reviews`, `notifications`, `audit_logs`, `files`, `admin_panel`.

**Stack**: Django 5.0 · Django REST Framework 3.15 · `drf-spectacular` (OpenAPI docs) · `django-filter` · `firebase-admin` · `django-environ` · `django-cors-headers` · `mssql-django` (Azure SQL Server in prod, SQLite locally) · `django-storages[azure]` · `gunicorn` · `whitenoise`

**Config pattern**: Use `django-environ` in `config/settings/base.py` to read all secrets from `backend/.env`. Never hard-code secrets. Settings split into `base.py`, `local.py`, `production.py`.

**Auth**: Firebase Authentication. The frontend obtains a Firebase ID token; the backend verifies it via `firebase-admin` in a custom authentication backend. No simplejwt or allauth. Protect views with `IsAuthenticated`. Role-based access (user/expert/admin) is enforced per-view via custom permissions.

**Abstract base models** (in `common/`):
- `UUIDModel` — UUID primary key
- `TimeStampedModel` — `created_at`, `updated_at`
- `SoftDeleteModel` — soft delete with `undelete()` support

**External integrations**:
- **Firebase Admin** — verifies frontend Firebase ID tokens server-side.
- **Agora** — video/audio RTC. Backend generates RTC tokens (`AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`); frontend joins via the Agora Web SDK.
- **SEPay** — Vietnamese bank-transfer payment gateway. Flow: generate order → display QR → await SEPay webhook → mark booking `PAID_CONFIRMED`.
- **Azure Blob Storage** — stores user-uploaded documents. `django-storages[azure]`, two containers: public (avatars, certificates) and private (booking documents).

**API docs**: Auto-generated via `drf-spectacular` at `/api/docs/` (Swagger UI), `/api/redoc/`, and schema at `/api/schema/`.

---

## Frontend Architecture

**Next.js 16.2.6 App Router** — read `frontend/node_modules/next/dist/docs/` before writing any Next.js code. This version has breaking changes vs. older Next.js.

**Route groups**:
- `(auth)/` — sign-in, sign-up, forgot-password
- `(public)/` — home, experts listing, about
- `admin/` — admin dashboard (users, experts, applications, bookings, payments, refunds, analytics)
- `booking/[expertId]/` — booking flow
- `consultation/[bookingId]/` — live video session
- `dashboard/` — user dashboard (consultations, profile, payments, notifications, expert application)
- `expert/` — expert dashboard (profile, availability, requests, sessions, earnings, reviews)
- `payment/[bookingId]/` — payment QR and confirmation

**State management**: Redux Toolkit (`store/slices/authSlice.ts`) wraps Firebase auth state. `AuthProvider` (Firebase context) + `ReduxProvider` are composed in `providers/index.tsx`.

**API calls**: The frontend calls the Django backend directly at `NEXT_PUBLIC_API_BASE_URL`. Use `fetch` or a thin wrapper in `lib/api.ts`. Firebase ID tokens are attached as `Authorization: Bearer <token>` headers.

**Auth**: Firebase SDK (`lib/firebase.ts`, `lib/firebase-auth.ts`). `useAuth` hook exposes current user and token.

**Forms**: React Hook Form + Zod for all form validation.

**Charts**: Recharts for analytics dashboards.

**Date handling**: `date-fns` + `react-day-picker` for calendar/availability UI.

**Styling**: Tailwind CSS v4 — syntax and config differ from v3. PostCSS-based; no `tailwind.config.js` by default.

---

## Domain Model & Key Business Rules

### Booking Status State Machine

```
DRAFT
  → PENDING_APPROVAL          (user submits request)
  → REJECTED                  (expert rejects)
  → APPROVED_AWAITING_PAYMENT (expert accepts; user has 24 h to pay)
  → EXPIRED_UNPAID            (payment deadline missed)
  → PAID_CONFIRMED            (SEPay webhook received)
  → IN_PROGRESS               (session window opens)
  → COMPLETED
  → CANCELLED_BY_USER
  → CANCELLED_BY_EXPERT
  → NO_SHOW_USER / NO_SHOW_EXPERT
  → REFUND_PENDING → REFUNDED
```

### Session Duration and Slots

Every availability **slot** is exactly **15 minutes** long. `AvailabilitySlot.end_time` is always `start_time + 15 min`.

Users select a total **session duration** of 30, 60, or 90 minutes at booking time (2, 4, or 6 consecutive slots). `BookingSlot` is the bridge table between `Booking` and `AvailabilitySlot`. Slots must be consecutive — no gaps allowed.

Total price: `n_slots × price_per_session` (where `price_per_session` is the expert's per-15-min price).

### Deadlines

- Expert must respond to a booking request within 24 h.
- User must pay within 24 h of approval **and** before session start time (whichever comes first).
- Reviews can be submitted within 7 days of session completion.
- Disputes must be raised within 48 h of session completion.

### Refund Rules

- User cancels ≥ 72 h before session → **50% refund**.
- Expert no-show → **100% refund**.
- User no-show → **no refund**.

### Expert Application Statuses

`PENDING_REVIEW` → `APPROVED` | `REJECTED` | `NEEDS_REVISION`

### Payment Statuses

`PENDING` → `PAID` | `FAILED` | `REFUNDED`

### Payout Statuses

`PENDING` → `APPROVED` | `REJECTED` | `PAID`

### Expert Profile Updates

Any significant profile update by an expert requires admin approval before the changes go public (`profile_status` field on `Expert` model).

---

## Audit & Compliance

All critical state transitions (booking status, payment status, expert application status) must be recorded in `AuditLog`. Fields: `actor` (FK User, nullable for system), `actor_role` (user/expert/admin/system), `action`, `target_type`, `target_id`, `previous_state` (JSON), `new_state` (JSON), `note`, `ip_address`. This is a **hard requirement**, not optional.

---

## Currency

All monetary values are in **Vietnamese Dong (VND)**. Store as integer (no decimals). Display with Vietnamese locale formatting.

---

## Database

**Production**: Azure SQL Server via `mssql-django`. Schema uses `UNIQUEIDENTIFIER` PKs for domain models.

**Local dev**: SQLite (set `DB_ENGINE=django.db.backends.sqlite3` in `.env`).

Schema source of truth: `database/01-init.sql` (T-SQL). Seed data in `database/02-seed.sql`.
