# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: MicroMentor

A knowledge marketplace that connects users with verified expert professionals for short, high-impact consultation sessions. The platform handles: expert discovery, booking requests, expert approval, payment processing, video consultation (Agora), reviews, and refund management.

Three roles: **User** (seeks advice), **Expert** (approved user who provides advice), **Administrator** (manages platform).

---

## Repository Layout

```
TMDT/
├── backend/          # Django 6 + DRF — single monolithic 'api' app
│   ├── config/       # Django project settings, urls, wsgi/asgi
│   ├── manage.py
│   └── .venv/        # Python virtual environment
└── frontend/         # Next.js 16 + React 19 + Tailwind CSS 4 (App Router)
    ├── app/          # Next.js App Router pages and layouts
    └── node_modules/
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
npm run dev       # dev server (port 3000)
npm run build     # production build
npm run lint      # ESLint
```

---

## Backend Architecture

**Single Django app** (all models, views, serializers in one app, e.g. `api/`). Add it to `INSTALLED_APPS` and mount its URLs at `/api/` in `config/urls.py`.

**Stack**: Django 6 · Django REST Framework · `djangorestframework-simplejwt` · `python-decouple` · `psycopg2` (PostgreSQL in prod, SQLite for local dev)

**Config pattern**: Use `python-decouple` in `config/settings.py` to read secrets from a `.env` file at the repo root. Never hard-code secrets.

**Auth**: JWT via `simplejwt`. Endpoints: `POST /api/token/` (obtain), `POST /api/token/refresh/`. Protect views with `IsAuthenticated`. Role-based access (user/expert/admin) is enforced per-view via custom permissions.

**External integrations**:
- **Agora** — video/audio RTC. Backend generates RTC tokens; frontend joins via the Agora Web SDK.
- **SEPay** — Vietnamese bank-transfer payment gateway. Flow: generate order → display QR → await SEPay webhook → mark booking paid.
- **Azure Blob Storage** — stores user-uploaded documents (resumes, code, designs).
- **Google OAuth** — social login via `social-auth-app-django` or `allauth`.

---

## Frontend Architecture

**Next.js 16 App Router** — read `frontend/node_modules/next/dist/docs/` before writing any Next.js code. This version has breaking changes vs. older Next.js.

**API calls**: The frontend calls the Django backend directly (no Next.js API proxy routes). Use `fetch` or a thin wrapper in `app/lib/api.ts`. Store the JWT in `httpOnly` cookies or `localStorage` depending on security tradeoff chosen.

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

**Session duration**: Every time slot is exactly **15 minutes** long. `sessionDurationMinutes` is always `15`; `slot.endTime` is always `slot.startTime + 15 min`.

**Multi-slot bookings**: A user may book multiple **consecutive** time slots with the same expert on the same day in a single booking request. Slots are consecutive when each slot's `endTime` equals the next slot's `startTime` (no gaps). The total price and duration scale linearly: `n` slots cost `n × pricePerSession` and last `n × 15` minutes.

**Deadlines**:
- Expert must respond within 24 h.
- User must pay within 24 h of approval **and** before session start time.
- Reviews can be submitted within 7 days of completion.
- Disputes must be raised within 48 h.

**Refund rules**:
- User cancels ≥72 h before session → 50% refund.
- Expert no-show → 50% refund (100% recommended for trust).
- User no-show → no refund.

### Expert Application Statuses
`PENDING_REVIEW` → `APPROVED` | `REJECTED` | `NEEDS_REVISION`

### Payment Statuses
`PENDING` → `PAID` | `FAILED` | `REFUNDED`

### Expert Profile Updates
Any significant profile update requires admin approval before going public.

---

## Audit & Compliance

All critical state transitions (booking status, payment status, expert application status) must be recorded in an audit log model. This is a hard requirement, not optional.
