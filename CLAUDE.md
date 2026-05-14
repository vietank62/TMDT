# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: MicroMentor

A knowledge marketplace that connects users with verified expert professionals for short, high-impact consultation sessions. The platform handles: expert discovery, booking requests, expert approval, payment processing, video consultation (Agora), reviews, and refund management.

Three roles: **User** (seeks advice), **Expert** (approved user who provides advice), **Administrator** (manages platform).

The UI language is **Vietnamese**. All user-facing labels, constants, and copy are in Vietnamese.

---

## Repository Layout

```
TMDT/
├── backend/
│   ├── api/          # Django app — models, views, serializers, permissions, urls
│   ├── config/       # Django project settings, urls, wsgi/asgi
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── app/          # Next.js App Router pages (see Frontend Architecture)
│   ├── components/   # Reusable React components (booking/, common/, layout/, payment/, ui/)
│   ├── constants/    # App-wide constants (categories, nav links, price ranges, durations)
│   ├── data/         # Mock data — replace with real API calls when backend is ready
│   ├── hooks/        # React hooks
│   ├── lib/          # Utilities (cn helper, etc.)
│   └── types/        # TypeScript domain types and enums (single source of truth)
├── database/
│   ├── init.sql      # Schema creation
│   └── seed.sql      # Seed data
├── .github/workflows/ # CI/CD
├── docker-compose.yaml
└── .venv/            # Python venv lives inside backend/
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

**Single Django app** (`api/`) with all models, views, serializers in one place. It is registered in `INSTALLED_APPS` and mounted at `/api/` in `config/urls.py`.

**Stack**: Django 6 · Django REST Framework · `djangorestframework-simplejwt` · `python-decouple` · `psycopg2` (PostgreSQL in prod, SQLite for local dev) · `django-cors-headers` · `django-allauth`

**Config pattern**: Use `python-decouple` in `config/settings.py` to read all secrets from `backend/.env`. Never hard-code secrets.

**Auth**: JWT via `simplejwt`. Endpoints: `POST /api/token/` (obtain), `POST /api/token/refresh/`. Protect views with `IsAuthenticated`. Role-based access (user/expert/admin) is enforced per-view via custom permissions in `api/permissions.py`.

**External integrations**:
- **Agora** — video/audio RTC. Backend generates RTC tokens; frontend joins via the Agora Web SDK.
- **SEPay** — Vietnamese bank-transfer payment gateway. Flow: generate order → display QR → await SEPay webhook → mark booking paid.
- **Azure Blob Storage** — stores user-uploaded documents (resumes, code, designs).
- **Google OAuth** — social login via `django-allauth`.

---

## Frontend Architecture

**Next.js 16 App Router** — read `frontend/node_modules/next/dist/docs/` before writing any Next.js code. This version has breaking changes vs. older Next.js.

**Route groups**:
- `(auth)/` — sign-in, sign-up, forgot-password
- `(public)/` — home, experts listing, about
- `admin/` — admin dashboard
- `booking/[expertId]/` — booking flow
- `consultation/[bookingId]/` — live video session
- `dashboard/` — user dashboard
- `expert/` — expert dashboard
- `payment/[bookingId]/` — payment QR and confirmation

**API calls**: The frontend calls the Django backend directly (no Next.js API proxy routes). Use `fetch` or a thin wrapper in `lib/api.ts`. Store the JWT in `httpOnly` cookies or `localStorage` depending on security tradeoff chosen.

**Forms**: React Hook Form + Zod for all form validation.

**Charts**: Recharts for analytics dashboards.

**Styling**: Tailwind CSS v4 — syntax and config differ from v3. PostCSS-based; no `tailwind.config.js` by default.

**Mock data**: `data/` directory contains mock data for all domain entities. These must be replaced by real API calls before production. Do not add business logic to mock data files.

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

Every availability **slot** is exactly **15 minutes** long. `slot.endTime` is always `slot.startTime + 15 min`.

Users select a total **session duration** of 30, 60, or 90 minutes at booking time. Internally, this maps to 2, 4, or 6 consecutive 15-minute slots respectively. A booking holds an array `slotIds: string[]` — all slot IDs covered by the session.

Slots are consecutive when each slot's `endTime` equals the next slot's `startTime` (no gaps allowed). The total price scales linearly: `n` slots cost `n × pricePerSession` (where `pricePerSession` is the expert's per-slot price, i.e., per 15 min).

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

### Expert Profile Updates

Any significant profile update by an expert requires admin approval before the changes go public.

---

## Audit & Compliance

All critical state transitions (booking status, payment status, expert application status) must be recorded in an audit log model. This is a **hard requirement**, not optional.

---

## Currency

All monetary values are in **Vietnamese Dong (VND)**. Store as integer (no decimals). Display with Vietnamese locale formatting.
