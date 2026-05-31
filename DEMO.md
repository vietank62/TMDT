# MicroMentor — End-to-End Demo & Tester Guide

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Accounts](#2-test-accounts)
3. [System Prerequisites](#3-system-prerequisites)
4. [Full End-to-End Demo Flow](#4-full-end-to-end-demo-flow)
   - 4.1 [Authentication Flow](#41-authentication-flow)
   - 4.2 [Expert Discovery Flow](#42-expert-discovery-flow)
   - 4.3 [Booking Flow](#43-booking-flow)
   - 4.4 [Payment Flow](#44-payment-flow)
   - 4.5 [Consultation Session Flow](#45-consultation-session-flow)
   - 4.6 [Expert Dashboard Flow](#46-expert-dashboard-flow)
   - 4.7 [User Dashboard Flow](#47-user-dashboard-flow)
   - 4.8 [Notification Flow](#48-notification-flow)
   - 4.9 [Admin Dashboard Flow](#49-admin-dashboard-flow)
5. [Important Testing Notes](#5-important-testing-notes)
6. [Suggested Demo Order](#6-suggested-demo-order)
7. [Expected Final Outcome](#7-expected-final-outcome)

---

## 1. Introduction

### What is MicroMentor?

MicroMentor is a Vietnamese knowledge marketplace that connects users with verified expert professionals for short, high-impact consultation sessions. The platform manages the full lifecycle of expert consultations: discovery, booking, payment, live video session, and post-session review.

### Three Roles

| Role | Description |
|------|-------------|
| **User** | Seeks advice; browses experts, books sessions, pays, attends consultations |
| **Expert** | An approved User who provides advice; manages availability, accepts/rejects bookings |
| **Administrator** | Manages the platform; approves expert applications, processes refunds, moderates reviews |

### Purpose of This Demo

This document is a step-by-step manual testing guide that walks a tester through the entire MicroMentor platform using real test accounts and seed data. It covers every major feature in a single continuous scenario.

### Features Covered in This Demo

- Firebase-based authentication (sign-in, sign-up, session handling)
- Expert discovery (browse, search, filter, profile view)
- Booking creation with availability slot selection and file upload
- SEPay payment via bank transfer QR code
- Real-time video consultation via Agora RTC
- Expert dashboard (availability, requests, sessions, earnings, reviews)
- User dashboard (consultations, payments, notifications, expert application)
- Admin dashboard (users, experts, applications, bookings, payments, refunds, analytics)
- Notification system
- Review submission (post-session)

---

## 2. Test Accounts

All accounts below are pre-seeded in the database and configured in Firebase.

### Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@gmail.com` |
| Password | `micromentor@dmin04` |
| Role | Administrator |
| Access | Full admin dashboard at `/admin` |

### User Account

| Field | Value |
|-------|-------|
| Full Name | User Four |
| Email | `user4@gmail.com` |
| Password | `micromentor@dmin04` |
| Role | Regular User |
| Access | User dashboard at `/dashboard` |

### Expert Account

| Field | Value |
|-------|-------|
| Full Name | Đặng Văn Phúc |
| Email | `expert7@gmail.com` |
| Password | `micromentor@dmin04` |
| Role | Expert (approved) |
| Access | Expert dashboard at `/expert` |

### Additional Seeded Experts (for browsing)

| Expert | Expertise | Price/15 min |
|--------|-----------|-------------|
| Phạm Minh Đức | Senior Software Engineer | 500,000 VND |
| Hoàng Thị Lan | Senior Data Scientist | 600,000 VND |
| Vũ Quốc Hùng | Senior Product Manager | 700,000 VND |
| Nguyễn Thị Mai | UX/UI Designer | varies |

---

## 3. System Prerequisites

### Required External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| Firebase Authentication | User auth and token issuance | `NEXT_PUBLIC_FIREBASE_*` env vars |
| Agora RTC | Live video consultation | `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE` |
| SEPay | Vietnamese bank transfer payments | `BANK_ACCOUNT`, `BANK_NAME`, `PRE_DESCRIPTION` |
| Azure Blob Storage | File uploads (avatars, documents, certificates) | `AZURE_ACCOUNT_NAME`, `AZURE_ACCOUNT_KEY` |
| Database | Azure SQL Server (prod) / SQLite (local dev) | `DB_ENGINE`, `DB_NAME`, `DB_*` vars |

### Backend Setup

```powershell
# 1. Activate virtual environment
backend\.venv\Scripts\Activate.ps1

# 2. Install dependencies (first time)
pip install -r backend/requirements.txt

# 3. Apply migrations
python backend/manage.py migrate

# 4. Run development server (port 8000)
python backend/manage.py runserver
```

Backend environment file: `backend/.env`

Required env vars in `backend/.env`:

```env
DEBUG=True
SECRET_KEY=<long-random-string>
ALLOWED_HOSTS=localhost,127.0.0.1

# Firebase
FIREBASE_CREDENTIALS_PATH=../certs/firebase-adminsdk.json
# OR: FIREBASE_CREDENTIALS_JSON=<inline JSON>

# Agora
AGORA_APP_ID=<agora-app-id>
AGORA_APP_CERTIFICATE=<agora-certificate>

# SEPay
BANK_ACCOUNT=<bank-account-number>
BANK_NAME=<bank-code-e.g.-VCB>
PRE_DESCRIPTION=<payment-description-prefix>

# Azure Storage
AZURE_ACCOUNT_NAME=<storage-account>
AZURE_ACCOUNT_KEY=<storage-key>
AZURE_CONTAINER_PUBLIC=public
AZURE_CONTAINER_PRIVATE=private

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Setup

```powershell
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (first time)
npm install

# 3. Run development server (port 3000)
npm run dev
```

Frontend environment file: `frontend/.env.local`

Required env vars in `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Docker Compose (Alternative)

```powershell
docker-compose up --build
```

This starts both backend (port 8000) and frontend (port 3000) containers.

### Application URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/v1/ |
| API Docs (Swagger) | http://localhost:8000/api/docs/ |
| API Docs (ReDoc) | http://localhost:8000/api/redoc/ |

### Database

- **Local dev**: SQLite (auto-created, no setup needed)
- **Production**: Azure SQL Server — schema at `database/01-init.sql`, seed at `database/02-seed.sql`
- To load seed data locally, run: `python backend/manage.py loaddata` or apply `database/02-seed.sql` directly

---

## 4. Full End-to-End Demo Flow

> **Note:** Open two browser windows (or use Incognito/Private mode for the second) to test both sides of interactions simultaneously — e.g., User in Window A, Expert in Window B.

---

### 4.1 Authentication Flow

#### Step 1 — Sign In as User

**Account:** `user4@gmail.com` / `micromentor@dmin04`

1. Open http://localhost:3000
2. Click **Đăng nhập** (Sign In) in the navigation bar, or navigate to `/sign-in`
3. Enter email `user4@gmail.com` and password `micromentor@dmin04`
4. Click the sign-in button

**Expected result:**
- Firebase issues an ID token
- The frontend calls `POST /api/v1/auth/sync` to sync the user to the local database
- You are redirected to the home page or dashboard
- The navigation bar updates to show the user's avatar and name
- The **Đăng nhập** button is replaced with a user menu

**Verify:**
- [ ] User name appears in the navigation bar
- [ ] No error messages
- [ ] Navigating to `/dashboard` works without redirect

#### Step 2 — Session Persistence

1. Refresh the page (F5)

**Expected result:**
- User remains logged in (Firebase persists the session in `localStorage`)
- Navigation still shows user menu

#### Step 3 — Sign Out

1. Click the user avatar/menu in the top navigation
2. Click **Đăng xuất** (Sign Out)

**Expected result:**
- Firebase session is cleared
- Redirected to home page `/`
- Navigation bar shows **Đăng nhập** again
- Accessing `/dashboard` redirects to `/sign-in`

#### Step 4 — Sign Up (New User Registration)

1. Navigate to `/sign-up`
2. Fill in: full name, email (use a new email not in the system), password (min 6 chars)
3. Click **Đăng ký** (Register)

**Expected result:**
- Firebase creates a new user account
- Backend syncs the new user record
- Redirected to dashboard or home
- User can immediately use the platform as a regular user

#### Step 5 — Forgot Password

1. Navigate to `/forgot-password`
2. Enter a registered email address
3. Click the reset button

**Expected result:**
- Firebase sends a password reset email
- Confirmation message shown on screen

---

### 4.2 Expert Discovery Flow

**Account:** `user4@gmail.com` (sign in first — see §4.1 Step 1)

#### Step 6 — Browse Experts

1. Navigate to `/experts`
2. Browse the expert listing grid

**Expected result:**
- Multiple expert cards displayed, each showing:
  - Expert name and title
  - Category (e.g., Software Engineering, Data Science)
  - Star rating and review count
  - Price per session (VND)
  - Skills (tags)
  - **Đặt lịch** (Book) button

**Verify:**
- [ ] At least 7–10 expert cards visible (from seed data)
- [ ] Rating badges display correctly
- [ ] Prices shown in Vietnamese Dong (VND) format

#### Step 7 — Search and Filter Experts

1. On the `/experts` page, use the search bar to type a keyword, e.g., `Python`
2. Apply a category filter (e.g., **Công nghệ** / Technology)
3. Apply a price range filter
4. Apply a minimum rating filter (e.g., 4.5+)
5. Try sorting by **Đánh giá cao nhất** (Highest Rated)

**Expected result:**
- Expert list updates to show only matching experts
- Filters can be combined
- Sort order changes the list ordering

**Verify:**
- [ ] Search by skill keyword filters correctly
- [ ] Category filter narrows results
- [ ] Price filter works
- [ ] Rating filter hides experts below threshold
- [ ] Sort order visibly changes card positions

#### Step 8 — View Expert Profile

1. Click on any expert card (e.g., **Phạm Minh Đức**)
2. Review the expert profile page at `/experts/[slug]`

**Expected result:**
Profile page shows:
- Avatar, name, title, company
- Bio and years of experience
- Category, skills as tags
- Languages spoken
- Certifications list
- Portfolio projects
- Pricing per session
- Star rating and total reviews
- List of public reviews (from seed data)
- **Đặt lịch ngay** (Book Now) button

**Verify:**
- [ ] All profile sections load
- [ ] Reviews section shows seeded reviews
- [ ] Book button is visible and links to booking flow

---

### 4.3 Booking Flow

**Accounts needed:**
- **User window:** `user4@gmail.com`
- **Expert window:** `expert7@gmail.com` (to verify expert sees the request)

#### Step 9 — Initiate Booking

1. As `user4@gmail.com`, navigate to the expert profile for **Đặng Văn Phúc** (or any expert) and click **Đặt lịch ngay**
2. You are taken to `/booking/[expertId]`

**Expected result:**
- Multi-step booking wizard opens (BookingStepper component)
- Step 1: Slot selection calendar

#### Step 10 — Select Availability Slots

1. On the booking calendar, navigate to a date that has available slots
2. Select 2, 4, or 6 consecutive 15-minute slots to get a 30, 60, or 90-minute session
3. The total price updates dynamically: `number_of_slots × price_per_session`

**Expected result:**
- Available (unbooked) slots are shown in a selectable state
- Already-booked slots are greyed out / disabled
- Selecting non-consecutive slots shows a validation error
- Total price and duration calculate correctly in real time

**Verify:**
- [ ] Slots load from `GET /api/v1/experts/<id>/availability`
- [ ] Price calculation is correct
- [ ] Duration summary (30/60/90 min) updates

#### Step 11 — Fill Booking Details

1. Proceed to the next step in the booking wizard
2. Fill in:
   - **Mô tả vấn đề** (Problem description): describe what you need help with
   - **Mục tiêu buổi tư vấn** (Session goals): what you want to achieve
3. Optionally upload a document (drag-and-drop or click to select)

**Expected result:**
- Form fields validate on submit (React Hook Form + Zod)
- File upload uses Azure Blob presigned URL flow:
  1. `POST /api/v1/uploads/presigned-url` → get upload URL
  2. Upload directly to Azure Blob
  3. `POST /api/v1/uploads/confirm` → confirm upload
- Uploaded file appears in the list with filename

**Verify:**
- [ ] Empty form shows validation errors
- [ ] File upload succeeds and shows uploaded filename
- [ ] Form accepts and stores the description

#### Step 12 — Confirm and Submit Booking

1. Review the booking summary (expert, slots, duration, total price, problem description)
2. Click **Xác nhận đặt lịch** (Confirm Booking)

**Expected result:**
- `POST /api/v1/bookings` is called
- Booking created with status `PENDING_APPROVAL`
- Expert's slots marked as `is_booked=True`
- Expert receives a notification: "Bạn có yêu cầu tư vấn mới từ [User Name]"
- User is redirected to their consultation detail page or dashboard

**Verify:**
- [ ] Booking appears in `/dashboard/consultations` with status **Chờ xác nhận**
- [ ] No slot can be double-booked

---

### 4.4 Payment Flow

**Prerequisite:** Expert must first approve the booking (see §4.6 Step 20).

#### Step 13 — Receive Payment Approval Notification (User)

1. As `user4@gmail.com`, check `/dashboard/notifications`

**Expected result:**
- Notification: "Yêu cầu tư vấn đã được chấp nhận. Vui lòng thanh toán trong 24 giờ."
- Booking status in `/dashboard/consultations` is now **Chờ thanh toán**

#### Step 14 — Open Payment Page

1. Click on the approved booking in `/dashboard/consultations`
2. Click **Thanh toán ngay** (Pay Now) or navigate to `/payment/[bookingId]`

**Expected result:**
- `POST /api/v1/payments/bookings/<bookingId>` is called
- Payment record created with status `PENDING`
- SEPay QR code displayed on screen

**Verify:**
- [ ] QR code image is visible
- [ ] Bank account number, bank name, and transfer amount (VND) are displayed
- [ ] Transfer description/reference code is shown
- [ ] Payment deadline countdown is visible

#### Step 15 — Simulate Payment (SEPay Webhook)

> **Note:** In a live environment, the user scans the QR code and transfers money via their bank app. SEPay then sends a webhook to the backend. For testing without a real bank transfer, simulate the webhook manually.

**Option A — Real payment (if SEPay is configured live):**
1. Open banking app on mobile
2. Scan the displayed QR code
3. Confirm the transfer
4. Wait 30–60 seconds for SEPay webhook to arrive

**Option B — Manual webhook simulation (for dev/testing):**
```powershell
curl -X POST http://localhost:8000/api/v1/payments/webhook/sepay `
  -H "Content-Type: application/json" `
  -d '{
    "id": 999001,
    "gateway": "Vietcombank",
    "transactionDate": "2026-05-31 08:30:00",
    "accountNumber": "123456789",
    "code": "<transfer_code_from_payment_record>",
    "content": "<transfer_code_from_payment_record> chuyen tien",
    "transferType": "in",
    "description": "Manual test payment",
    "transferAmount": <payment_amount>,
    "accumulated": <payment_amount>,
    "referenceCode": "TEST-REF-001"
  }'
```
Replace the placeholders with the `transfer_code` and `amount` returned by the payment API.

**Expected result after webhook:**
- Payment status: `PENDING` → `PAID`
- Booking status: `APPROVED_AWAITING_PAYMENT` → `PAID_CONFIRMED`
- Both user and expert receive notifications confirming payment
- Payment page updates to show **Thanh toán thành công** (Payment Successful)

**Verify:**
- [ ] Booking status in `/dashboard/consultations` shows **Đã thanh toán**
- [ ] Expert's `/expert/sessions` now shows the booking as upcoming
- [ ] Both parties received payment confirmation notifications

---

### 4.5 Consultation Session Flow

**Prerequisite:** Booking must be in `PAID_CONFIRMED` status and within the scheduled session window.

**Accounts needed (two browser windows):**
- Window A: `user4@gmail.com`
- Window B: `expert7@gmail.com`

#### Step 16 — Join Consultation (User)

1. As `user4@gmail.com`, navigate to `/dashboard/consultations`
2. Find the booking with status **Đã thanh toán** / **Đang diễn ra**
3. Click **Vào phòng tư vấn** (Enter Consultation Room)
4. You are taken to `/consultation/[bookingId]`

**Expected result:**
- Page requests camera and microphone permissions from the browser
- `POST /api/v1/bookings/<id>/session-token` is called
- Backend returns Agora token, channel name (`booking-<id>`), uid, and app_id
- Booking status updates to `IN_PROGRESS`
- Local video preview appears

**Verify:**
- [ ] Browser permission dialog for camera/microphone appears
- [ ] Local video stream shows in a preview box
- [ ] Channel name and connection status visible in UI

#### Step 17 — Join Consultation (Expert)

1. As `expert7@gmail.com` in Window B, navigate to `/expert/sessions`
2. Find the same booking and click **Vào phòng tư vấn**

**Expected result:**
- Expert joins the same Agora channel
- In Window A (User): expert's video stream appears
- In Window B (Expert): user's video stream appears

**Verify:**
- [ ] Two-way video established
- [ ] Audio is working (speak and confirm the other party can hear)
- [ ] Both streams display without major lag

#### Step 18 — Use Session Controls

1. Toggle microphone off and on (mute button)
2. Toggle camera off and on
3. Test screen sharing (click screen share button → select a window/screen)
4. Check the text chat sidebar if available

**Expected result:**
- Mic toggle: remote party sees mic icon muted; audio stops/resumes
- Camera toggle: remote video goes blank; resumes on un-toggle
- Screen share: selected screen is broadcast to the remote party
- Chat messages (if implemented) appear in the sidebar

#### Step 19 — End Session and Submit Review

1. Either party clicks **Kết thúc** (End / Leave)
2. `POST /api/v1/bookings/<id>/complete` is called
3. Booking status changes to `COMPLETED`

**As the User (Window A), submit a review:**
1. After the session ends, a review form appears (or navigate to `/dashboard/consultations/[id]`)
2. Select a star rating (1–5)
3. Write a comment
4. Submit the review (`POST /api/v1/reviews`)

**Expected result:**
- Review is saved and appears on the expert's public profile under the reviews section
- Expert receives a notification: "Bạn có một đánh giá mới"
- Review is only submittable within 7 days of session completion

**Verify:**
- [ ] Booking status is `COMPLETED` in dashboard
- [ ] Review appears on expert's `/experts/[slug]` profile page
- [ ] Expert's rating average updates

---

### 4.6 Expert Dashboard Flow

**Account:** `expert7@gmail.com`

#### Step 20 — Log In as Expert

1. Sign in with `expert7@gmail.com` / `micromentor@dmin04`
2. Navigate to `/expert` (expert dashboard home)

**Expected result:**
- Expert dashboard with sidebar navigation loads
- Dashboard shows summary stats (upcoming sessions, pending requests, total earnings)

#### Step 21 — Manage Availability Slots

1. Navigate to `/expert/availability`
2. Review the calendar view showing existing slots

**To add a new slot:**
1. Select a date and time in the calendar
2. Click to add a 15-minute slot
3. Confirm creation (`POST /api/v1/expert/availability`)

**To delete a slot:**
1. Click on an existing unbooked slot
2. Click **Xóa** (Delete) → confirm

**Expected result:**
- New slot appears in the calendar
- Deleted slot disappears
- Booked slots cannot be deleted (locked/disabled UI)

**Verify:**
- [ ] New slot is visible on the public booking calendar (`/booking/[expertId]`)
- [ ] Deleting a booked slot is blocked

#### Step 22 — Review and Approve/Reject Booking Request

1. Navigate to `/expert/requests`
2. Find the pending booking request from `user4@gmail.com` (created in §4.3)

**To approve:**
1. Click **Chấp nhận** (Approve) on the booking card
2. Optionally add a note to the user
3. Confirm

**Expected result:**
- `POST /api/v1/bookings/<id>/approve` called
- Booking status: `PENDING_APPROVAL` → `APPROVED_AWAITING_PAYMENT`
- User receives notification to proceed with payment
- Booking moves out of the requests list

**To reject (test separately with a second booking):**
1. Click **Từ chối** (Reject)
2. Enter a rejection reason (required)
3. Confirm

**Expected result:**
- Booking status → `REJECTED`
- Slots freed (is_booked=False)
- User receives rejection notification with reason

**Verify:**
- [ ] Approved booking disappears from Requests tab and appears in Sessions
- [ ] Rejected booking disappears; slots are available again for new bookings

#### Step 23 — View Upcoming Sessions

1. Navigate to `/expert/sessions`
2. Review upcoming confirmed sessions (status: `PAID_CONFIRMED`, `IN_PROGRESS`)

**Expected result:**
- Each session card shows: user name, date/time, duration, fee
- **Vào phòng tư vấn** button links to `/consultation/[bookingId]`

**Verify:**
- [ ] Session times are correct
- [ ] Join button is active at session time

#### Step 24 — View Consultation History

1. Navigate to `/expert/history`
2. Review past sessions

**Expected result:**
- Completed, cancelled, and no-show sessions are listed
- Each entry shows earnings from that session

#### Step 25 — View Earnings Dashboard

1. Navigate to `/expert/earnings`

**Expected result:**
- Summary cards:
  - **Tổng thu nhập** (Total Earnings)
  - **Số dư khả dụng** (Available Balance / pending_balance)
  - **Đã thanh toán** (Total Paid Out)
- Payout history list (past payout requests and their statuses)
- **Yêu cầu thanh toán** (Request Payout) button

**To request a payout:**
1. Click **Yêu cầu thanh toán**
2. Enter bank account details and amount
3. Submit (`POST /api/v1/expert/payouts`)

**Expected result:**
- Payout request created with status `PENDING`
- Appears in payout history list
- Admin must process it (see §4.9 Step 37)

#### Step 26 — View Reviews

1. Navigate to `/expert/reviews`

**Expected result:**
- All reviews from completed sessions are listed
- Each review shows: user name, star rating, comment, date
- Average rating displayed at top

#### Step 27 — Update Expert Profile

1. Navigate to `/expert/profile`
2. Update any field (e.g., add a skill, update bio)
3. Click **Lưu thay đổi** (Save Changes)

**Expected result:**
- `PATCH /api/v1/expert/profile` called
- Profile status changes to `PENDING_REVIEW` (requires admin re-approval for significant changes)
- Success notification shown

**Verify:**
- [ ] Updated fields visible after save
- [ ] Admin receives notification of profile change (visible in admin panel)

---

### 4.7 User Dashboard Flow

**Account:** `user4@gmail.com`

#### Step 28 — View Consultation History

1. Navigate to `/dashboard/consultations`

**Expected result:**
- List of all bookings with status badges:
  - `PENDING_APPROVAL` → **Chờ xác nhận**
  - `APPROVED_AWAITING_PAYMENT` → **Chờ thanh toán**
  - `PAID_CONFIRMED` → **Đã thanh toán**
  - `IN_PROGRESS` → **Đang diễn ra**
  - `COMPLETED` → **Hoàn thành**
  - `CANCELLED_BY_USER` → **Đã hủy**

**Verify:**
- [ ] All bookings made in this demo appear
- [ ] Statuses are accurate and color-coded

#### Step 29 — View Consultation Detail

1. Click on a completed booking
2. Navigate to `/dashboard/consultations/[id]`

**Expected result:**
- Full booking details: expert info, date/time, duration, price paid
- Problem description and session goals shown
- Any uploaded documents listed with download links
- Review submitted (if done) or review form (within 7-day window)

#### Step 30 — View Payment History

1. Navigate to `/dashboard/payments`

**Expected result:**
- List of all payments with:
  - Amount (VND)
  - Status (PENDING / PAID / FAILED / REFUNDED)
  - Payment date
  - Related booking reference

#### Step 31 — Update User Profile

1. Navigate to `/dashboard/profile`
2. Update name, phone number, or timezone
3. Click **Lưu thay đổi**

**Expected result:**
- `PATCH /api/v1/users/me` called
- Profile updated successfully

#### Step 32 — Apply to Become an Expert

1. Navigate to `/dashboard/become-expert`
2. Fill in the expert application form:
   - Professional title, company, bio
   - Years of experience
   - Category (e.g., Công nghệ)
   - Skills (add multiple)
   - Price per 15-minute session (VND)
   - LinkedIn URL and portfolio URL
   - Certifications (name, issuer, year)
   - Portfolio items (title, description, URL)
3. Click **Nộp đơn** (Submit Application)

**Expected result:**
- `POST /api/v1/expert-applications` called
- Application status: `PENDING_REVIEW`
- Admin is notified of new application
- Application status visible in `/dashboard/become-expert`

**Verify:**
- [ ] Form validation works (required fields highlighted)
- [ ] Application appears in admin panel under `/admin/applications`

---

### 4.8 Notification Flow

**Account:** `user4@gmail.com` (or `expert7@gmail.com`)

#### Step 33 — View Notifications

1. Navigate to `/dashboard/notifications`

**Expected result:**
- Notification list (newest first) including events triggered during this demo:
  - Booking request submitted → expert notified
  - Booking approved → user notified
  - Payment confirmed → both notified
  - Session started → both notified
  - Review submitted → expert notified

Each notification shows:
- Title and message
- Timestamp
- Read/unread status (unread items visually highlighted)

#### Step 34 — Mark Notifications as Read

1. Click on a single unread notification to mark it read (`POST /api/v1/notifications/<id>/read`)
2. Click **Đánh dấu tất cả đã đọc** (Mark All as Read) button (`POST /api/v1/notifications/read-all`)

**Expected result:**
- Individual notification: unread indicator removed
- Mark All: all notifications shown as read

**Verify:**
- [ ] Notification badge count in the nav bar decrements
- [ ] Read state persists after page refresh

---

### 4.9 Admin Dashboard Flow

**Account:** `admin@gmail.com` / `micromentor@dmin04`

#### Step 35 — Log In as Admin

1. Sign out of any existing session
2. Sign in with `admin@gmail.com` / `micromentor@dmin04`
3. Navigate to `/admin`

**Expected result:**
- Admin dashboard with sidebar loads
- KPI cards show:
  - Total registered users
  - Total approved experts
  - Total bookings (all statuses)
  - Total revenue (VND)
- Charts: monthly revenue trends, booking status distribution

#### Step 36 — Review Expert Application

1. Navigate to `/admin/applications`
2. Find the application submitted by `user4@gmail.com` (from §4.7 Step 32)

**To approve:**
1. Click on the application to open detail at `/admin/applications/[id]`
2. Review all sections: bio, skills, certifications, portfolio, LinkedIn
3. Click **Phê duyệt** (Approve)

**Expected result:**
- `POST /api/v1/admin/applications/<id>/approve` called
- Application status: `PENDING_REVIEW` → `APPROVED`
- User account gains expert role
- Expert profile created and marked `APPROVED`
- User receives approval notification

**To request revision:**
1. Click **Yêu cầu chỉnh sửa** (Request Revision) instead
2. Enter revision notes
3. Submit

**Expected result:**
- Application status → `NEEDS_REVISION`
- User notified with revision notes

#### Step 37 — Process Expert Payout

1. Navigate to `/admin` then look for payouts, or use the API at `/api/v1/admin/payouts`
2. Find the payout request from `expert7@gmail.com` (from §4.6 Step 25)

**To approve:**
1. Click **Phê duyệt** (Approve)
2. Enter transaction reference (bank transfer reference)
3. Confirm

**Expected result:**
- Payout status: `PENDING` → `PAID`
- Expert's `pending_balance` reduced by payout amount
- Expert receives payout confirmation notification

#### Step 38 — Manage Users

1. Navigate to `/admin/users`

**Expected result:**
- Full user list with:
  - Name, email, role, registration date
  - Active/inactive status

2. Click on a user to view details
3. Update a field (e.g., toggle active status)

**Verify:**
- [ ] User list loads with all seeded users
- [ ] User detail shows full profile

#### Step 39 — View and Manage Experts

1. Navigate to `/admin/experts`
2. Review the expert list (all approved experts from seed data)
3. Click an expert to view detail
4. Test **Khóa hồ sơ** (Reject/Block Profile) if needed

**Expected result:**
- Expert list shows rating, session count, revenue
- Profile approval/rejection controls are functional

#### Step 40 — View All Bookings

1. Navigate to `/admin/bookings`

**Expected result:**
- Full list of all bookings across all users with:
  - Booking ID, user name, expert name, status, scheduled date, amount
- Click a booking to view full detail

**Verify:**
- [ ] Booking created in §4.3 is listed here with correct status history

#### Step 41 — View Payments and Process Refund

1. Navigate to `/admin/payments`

**Expected result:**
- Payment summary cards (total paid, total pending, total refunded)
- Full payment list

**To initiate a refund:**
1. Find a payment in `PAID` status
2. Click **Hoàn tiền** (Refund)
3. Enter refund amount (full or partial)
4. Confirm (`POST /api/v1/admin/payments/<id>/refund`)

**Expected result:**
- Payment status → `REFUNDED`
- Booking status → `REFUND_PENDING` → `REFUNDED`
- User receives refund notification

#### Step 42 — Process Refund Requests

1. Navigate to `/admin/refunds`

**Expected result:**
- List of bookings with status `REFUND_PENDING`
- For each, admin can **Xử lý hoàn tiền** (Process) or **Từ chối** (Reject)

**To process:**
1. Click **Xử lý hoàn tiền**
2. Enter bank transfer reference
3. Confirm

**Expected result:**
- Refund marked as processed
- User notified of refund completion

#### Step 43 — Moderate Reviews

1. Navigate to `/admin/reviews`

**Expected result:**
- All reviews across the platform listed with:
  - Expert name, user name, rating, comment, date, visibility (public/hidden)

**To hide an inappropriate review:**
1. Click **Ẩn** (Hide) on a review
2. Confirm (`POST /api/v1/admin/reviews/<id>/hide`)

**Expected result:**
- Review no longer appears on the expert's public profile
- Status changes to hidden

**To restore:**
1. Click **Hiện** (Show) (`POST /api/v1/admin/reviews/<id>/show`)

#### Step 44 — View Analytics

1. Navigate to `/admin/analytics`

**Expected result:**
- Extended analytics view with:
  - Revenue trends by month (bar/line chart using Recharts)
  - Booking volume over time
  - Top-performing experts by revenue/sessions
  - Category distribution

**Verify:**
- [ ] Charts render without errors
- [ ] Data matches the bookings created during this demo

#### Step 45 — View Audit Logs

**API only** (no dedicated frontend page): `GET /api/v1/admin/audit-logs`

**Expected result:**
- Immutable trail of all critical state transitions during this demo:
  - Booking status changes
  - Payment status changes
  - Expert application status changes
- Each entry: actor, role, action, previous_state, new_state, timestamp, IP address

---

## 5. Important Testing Notes

### External Service Dependencies

| Service | Impact if not configured | Workaround |
|---------|--------------------------|-----------|
| Firebase Auth | Login/signup completely broken | Must be configured; no workaround |
| Agora RTC | No video in consultation room | Session token still issues; page loads |
| SEPay | No QR code or payment webhook | Simulate webhook manually (see §4.4 Step 15) |
| Azure Blob Storage | File uploads fail | Skip file upload steps; rest of booking works |

### Known Limitations

1. **SEPay payment** requires a real Vietnamese bank account and SEPay merchant setup for end-to-end testing. For development, simulate the webhook manually as described in §4.4 Step 15.

2. **Agora video** requires valid `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`. Without these, the session-token endpoint will fail and `/consultation/[bookingId]` won't connect. The page may still load but video won't work.

3. **Session timing**: Bookings are attached to actual `AvailabilitySlot` times. The **Vào phòng tư vấn** (Join) button may only be active around the scheduled session time. For testing, either create a slot at the current time or adjust the booking directly in the database.

4. **Email notifications**: The platform sends in-app notifications (stored in the database). Email delivery (if configured) depends on SMTP settings not always present in development.

5. **Expert profile approval**: When an expert updates their profile significantly, it goes to `PENDING_REVIEW`. The profile changes may not be visible publicly until admin approves. This is by design.

6. **Review 7-day window**: Reviews can only be submitted within 7 days of session completion. For testing, ensure you test the review flow immediately after completing a session.

7. **Payment deadline**: Users have 24 hours to pay after expert approval (or until session start, whichever is first). If this deadline is missed, the booking moves to `EXPIRED_UNPAID`. Test payment steps promptly.

8. **Database**: In local SQLite mode, some complex queries optimized for MS SQL Server may behave slightly differently. For production-accurate testing, use Azure SQL Server with the provided schema.

### Mocked / Simplified Features

- The SEPay QR code URL is constructed client-side using a standard format. In production, this would be generated by SEPay's API.
- The bank account shown in payment QR is configured via `BANK_ACCOUNT` env var (may be a test account).

---

## 6. Suggested Demo Order

Follow this order to avoid dependency failures between flows:

```
1.  Admin login (§4.9 Step 35)          — verify admin dashboard loads
2.  Expert login (§4.6 Step 20)         — verify expert dashboard loads
3.  Expert: add availability slots      — create bookable slots (§4.6 Step 21)
4.  User login (§4.1 Step 1)            — verify user auth
5.  User: browse + filter experts       — verify discovery (§4.2 Steps 6–8)
6.  User: view expert profile           — verify profile detail (§4.2 Step 8)
7.  User: create booking                — select slots, upload doc, submit (§4.3 Steps 9–12)
8.  Expert: approve booking             — approve request (§4.6 Step 22)
9.  User: receive notification          — verify notification (§4.8 Steps 33–34)
10. User: pay via SEPay QR              — open payment page (§4.4 Steps 13–14)
11. Simulate SEPay webhook              — mark booking PAID_CONFIRMED (§4.4 Step 15)
12. Expert → User: join consultation   — both enter room, test video (§4.5 Steps 16–18)
13. End session + submit review         — complete booking, leave review (§4.5 Step 19)
14. Expert: check earnings dashboard    — verify revenue (§4.6 Step 25)
15. Expert: request payout              — submit payout (§4.6 Step 25)
16. Admin: review expert application    — approve application (§4.9 Step 36)
17. Admin: process payout               — approve expert payout (§4.9 Step 37)
18. Admin: process refund (optional)    — test refund flow (§4.9 Steps 41–42)
19. Admin: moderate reviews             — hide/show review (§4.9 Step 43)
20. Admin: view analytics               — verify charts (§4.9 Step 44)
```

---

## 7. Expected Final Outcome

A successful end-to-end test execution should produce the following observable state across the system:

### Database State

| Entity | Status |
|--------|--------|
| Booking | Status = `COMPLETED` |
| Payment | Status = `PAID` |
| Review | Submitted, `is_public = True`, visible on expert profile |
| AvailabilitySlots | `is_booked = True` for all slots used in booking |
| Notification | Multiple notifications, all marked `is_read = True` |
| AuditLog | Full trail of all status transitions recorded |
| Payout (if tested) | Status = `PAID` after admin approval |

### Frontend State

| Page | Expected Content |
|------|-----------------|
| `/dashboard/consultations` | Booking with status **Hoàn thành** |
| `/dashboard/payments` | Payment with status **Đã thanh toán** |
| `/dashboard/notifications` | All notifications read |
| `/expert/sessions` | Session appears in history with earnings |
| `/expert/earnings` | Balance updated (total_earnings increased) |
| `/experts/[slug]` | New review visible with correct star rating |
| `/admin` | KPI numbers reflect all activity from demo |
| `/admin/bookings` | Booking visible with `COMPLETED` status |
| `/admin/payments` | Payment visible with `PAID` status |

### Behavioral Verification

- [ ] Firebase authentication works for all three roles
- [ ] Role-based access control is enforced (user cannot access `/expert` or `/admin`; expert cannot access `/admin`)
- [ ] Booking slot exclusivity: slots used in the demo booking are not available for other users
- [ ] Agora video session established between two parties in the same channel
- [ ] SEPay webhook correctly triggered status transitions
- [ ] Review appears on the expert's public profile page
- [ ] Audit log contains records for every state transition (verifiable via `GET /api/v1/admin/audit-logs`)
- [ ] All notifications were delivered and can be marked as read

---

*This document was generated based on the actual implemented source code in the MicroMentor repository. All routes, API endpoints, and flows described correspond to implemented functionality.*
