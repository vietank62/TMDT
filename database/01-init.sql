-- =============================================================
-- MicroMentor — Azure SQL Server (T-SQL) schema
-- Run once on a fresh database before Django migrations.
-- App table PKs: UNIQUEIDENTIFIER (UUID v4 via NEWID()).
-- Django system table PKs: integers, as Django expects.
-- =============================================================

-- =============================================================
-- Django system tables  (types must match what Django generates)
-- =============================================================

CREATE TABLE django_migrations (
    id      BIGINT IDENTITY(1,1) PRIMARY KEY,
    app     NVARCHAR(255) NOT NULL,
    name    NVARCHAR(255) NOT NULL,
    applied DATETIME2     NOT NULL
);

CREATE TABLE django_content_type (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    app_label NVARCHAR(100) NOT NULL,
    model     NVARCHAR(100) NOT NULL,
    CONSTRAINT uq_django_content_type UNIQUE (app_label, model)
);

CREATE TABLE auth_permission (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(255) NOT NULL,
    content_type_id INT           NOT NULL,
    codename        NVARCHAR(100) NOT NULL,
    CONSTRAINT uq_auth_permission    UNIQUE (content_type_id, codename),
    CONSTRAINT fk_auth_permission_ct FOREIGN KEY (content_type_id) REFERENCES django_content_type(id)
);

CREATE TABLE auth_group (
    id   INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE auth_group_permissions (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    group_id      INT NOT NULL,
    permission_id INT NOT NULL,
    CONSTRAINT uq_auth_group_permissions      UNIQUE (group_id, permission_id),
    CONSTRAINT fk_auth_group_permissions_grp  FOREIGN KEY (group_id)      REFERENCES auth_group(id),
    CONSTRAINT fk_auth_group_permissions_perm FOREIGN KEY (permission_id) REFERENCES auth_permission(id)
);

-- =============================================================
-- Users  (AUTH_USER_MODEL = "users.User", db_table = "users")
-- =============================================================

CREATE TABLE users (
    id                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    firebase_uid      NVARCHAR(128)    NOT NULL,
    email             NVARCHAR(254)    NOT NULL,
    password          NVARCHAR(128)    NOT NULL DEFAULT '!',
    full_name         NVARCHAR(255)    NOT NULL DEFAULT '',
    avatar_url        NVARCHAR(200)    NOT NULL DEFAULT '',
    phone_number      NVARCHAR(20)     NOT NULL DEFAULT '',
    bio               NVARCHAR(MAX)    NOT NULL DEFAULT '',
    timezone          NVARCHAR(64)     NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    profile_completed BIT              NOT NULL DEFAULT 0,
    is_active         BIT              NOT NULL DEFAULT 1,
    is_staff          BIT              NOT NULL DEFAULT 0,
    is_superuser      BIT              NOT NULL DEFAULT 0,
    last_login        DATETIME2        NULL,
    created_at        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT uq_users_firebase_uid UNIQUE (firebase_uid),
    CONSTRAINT uq_users_email        UNIQUE (email)
);

CREATE INDEX ix_users_firebase_uid ON users (firebase_uid);

-- User ↔ Group M2M  (Django generates BIGINT IDENTITY pk, UUID FK to users)
CREATE TABLE users_user_groups (
    id       BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id  UNIQUEIDENTIFIER NOT NULL,
    group_id INT              NOT NULL,
    CONSTRAINT uq_users_user_groups      UNIQUE (user_id, group_id),
    CONSTRAINT fk_users_user_groups_user FOREIGN KEY (user_id)  REFERENCES users(id),
    CONSTRAINT fk_users_user_groups_grp  FOREIGN KEY (group_id) REFERENCES auth_group(id)
);

-- User ↔ Permission M2M  (Django generates BIGINT IDENTITY pk, UUID FK to users)
CREATE TABLE users_user_user_permissions (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id       UNIQUEIDENTIFIER NOT NULL,
    permission_id INT              NOT NULL,
    CONSTRAINT uq_users_user_permissions      UNIQUE (user_id, permission_id),
    CONSTRAINT fk_users_user_permissions_user FOREIGN KEY (user_id)       REFERENCES users(id),
    CONSTRAINT fk_users_user_permissions_perm FOREIGN KEY (permission_id) REFERENCES auth_permission(id)
);

-- Sessions
CREATE TABLE django_session (
    session_key  NVARCHAR(40)  NOT NULL PRIMARY KEY,
    session_data NVARCHAR(MAX) NOT NULL,
    expire_date  DATETIME2     NOT NULL
);

CREATE INDEX ix_django_session_expire ON django_session (expire_date);

-- Django admin action log  (INT pk, INT content_type_id, UUID user_id)
CREATE TABLE django_admin_log (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    action_time     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    object_id       NVARCHAR(MAX)    NULL,
    object_repr     NVARCHAR(200)    NOT NULL,
    action_flag     SMALLINT         NOT NULL CHECK (action_flag >= 1),
    change_message  NVARCHAR(MAX)    NOT NULL DEFAULT '',
    content_type_id INT              NULL,
    user_id         UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_admin_log_ct   FOREIGN KEY (content_type_id) REFERENCES django_content_type(id),
    CONSTRAINT fk_admin_log_user FOREIGN KEY (user_id)         REFERENCES users(id)
);

-- =============================================================
-- Experts
-- =============================================================

CREATE TABLE experts (
    id                       UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    user_id                  UNIQUEIDENTIFIER NOT NULL,
    slug                     NVARCHAR(255)    NOT NULL,
    display_name             NVARCHAR(255)    NOT NULL DEFAULT '',
    title                    NVARCHAR(255)    NOT NULL DEFAULT '',
    company                  NVARCHAR(255)    NULL,
    bio                      NVARCHAR(MAX)    NOT NULL DEFAULT '',
    category                 NVARCHAR(100)    NOT NULL DEFAULT '',
    skills                   NVARCHAR(MAX)    NOT NULL DEFAULT '[]',  -- JSON array
    languages                NVARCHAR(MAX)    NOT NULL DEFAULT '[]',  -- JSON array
    years_of_experience      INT              NOT NULL DEFAULT 0,
    price_per_session        INT              NOT NULL DEFAULT 0,      -- VND per session
    session_duration_minutes INT              NOT NULL DEFAULT 60 CHECK (session_duration_minutes IN (30, 60, 90)),
    rating                   DECIMAL(3,2)     NOT NULL DEFAULT 0.00,
    review_count             INT              NOT NULL DEFAULT 0,
    total_sessions           INT              NOT NULL DEFAULT 0,
    total_earnings           INT              NOT NULL DEFAULT 0,      -- VND
    pending_balance          INT              NOT NULL DEFAULT 0,      -- VND
    profile_picture_url      NVARCHAR(500)    NULL,
    linkedin_url             NVARCHAR(500)    NULL,
    portfolio_url            NVARCHAR(500)    NULL,
    certifications           NVARCHAR(MAX)    NOT NULL DEFAULT '[]',   -- JSON array
    portfolio                NVARCHAR(MAX)    NOT NULL DEFAULT '[]',   -- JSON array
    is_available             BIT              NOT NULL DEFAULT 1,
    profile_status           NVARCHAR(20)     NOT NULL DEFAULT 'PENDING_REVIEW',
    admin_note               NVARCHAR(MAX)    NULL,
    reviewed_at              DATETIME2        NULL,
    submitted_at             DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    deleted_at               DATETIME2        NULL,
    created_at               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT uq_experts_user_id  UNIQUE (user_id),
    CONSTRAINT uq_experts_slug     UNIQUE (slug),
    CONSTRAINT fk_experts_user     FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_experts_status  CHECK (profile_status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION')),
    CONSTRAINT chk_experts_price   CHECK (price_per_session >= 0),
    CONSTRAINT chk_experts_rating  CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX ix_experts_category       ON experts (category);
CREATE INDEX ix_experts_profile_status ON experts (profile_status);

-- =============================================================
-- Availability slots  (each slot = exactly 15 minutes)
-- =============================================================

CREATE TABLE availability_slots (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    expert_id   UNIQUEIDENTIFIER NOT NULL,
    start_time  DATETIME2        NOT NULL,
    end_time    AS DATEADD(MINUTE, 15, start_time) PERSISTED,
    is_booked   BIT              NOT NULL DEFAULT 0,
    created_at  DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at  DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT uq_availability_slots_expert_start UNIQUE (expert_id, start_time),
    CONSTRAINT fk_availability_slots_expert       FOREIGN KEY (expert_id) REFERENCES experts(id)
);

CREATE INDEX ix_availability_slots_expert_time ON availability_slots (expert_id, start_time);

-- =============================================================
-- Bookings
-- =============================================================

CREATE TABLE bookings (
    id                       UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    user_id                  UNIQUEIDENTIFIER NOT NULL,
    expert_id                UNIQUEIDENTIFIER NOT NULL,
    status                   NVARCHAR(30)     NOT NULL DEFAULT 'DRAFT',
    problem_description      NVARCHAR(MAX)    NOT NULL DEFAULT '',
    session_goals            NVARCHAR(MAX)    NOT NULL DEFAULT '',
    document_urls            NVARCHAR(MAX)    NOT NULL DEFAULT '[]',  -- JSON array of URLs
    scheduled_at             DATETIME2        NULL,
    duration_minutes         INT              NOT NULL DEFAULT 30 CHECK (duration_minutes IN (30, 60, 90)),
    price_vnd                INT              NOT NULL DEFAULT 0,
    expert_response_deadline DATETIME2        NULL,
    payment_deadline         DATETIME2        NULL,
    rejection_reason         NVARCHAR(MAX)    NULL,
    expert_note              NVARCHAR(MAX)    NULL,
    agora_channel            NVARCHAR(255)    NOT NULL DEFAULT '',
    deleted_at               DATETIME2        NULL,
    created_at               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at               DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_bookings_user   FOREIGN KEY (user_id)   REFERENCES users(id),
    CONSTRAINT fk_bookings_expert FOREIGN KEY (expert_id) REFERENCES experts(id),
    CONSTRAINT chk_bookings_status CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'APPROVED_AWAITING_PAYMENT',
        'EXPIRED_UNPAID', 'PAID_CONFIRMED', 'IN_PROGRESS', 'COMPLETED',
        'CANCELLED_BY_USER', 'CANCELLED_BY_EXPERT',
        'NO_SHOW_USER', 'NO_SHOW_EXPERT',
        'REFUND_PENDING', 'REFUNDED'
    )),
    CONSTRAINT chk_bookings_price CHECK (price_vnd >= 0)
);

CREATE INDEX ix_bookings_user        ON bookings (user_id);
CREATE INDEX ix_bookings_expert      ON bookings (expert_id);
CREATE INDEX ix_bookings_status      ON bookings (status);
CREATE INDEX ix_bookings_scheduled   ON bookings (scheduled_at);
CREATE INDEX ix_bookings_deleted_at  ON bookings (deleted_at);
CREATE INDEX ix_experts_deleted_at   ON experts (deleted_at);

-- Slots reserved by a booking (2 slots = 30 min, 4 = 60 min, 6 = 90 min)
CREATE TABLE booking_slots (
    id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    booking_id UNIQUEIDENTIFIER NOT NULL,
    slot_id    UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT uq_booking_slots             UNIQUE (booking_id, slot_id),
    CONSTRAINT fk_booking_slots_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    CONSTRAINT fk_booking_slots_slot    FOREIGN KEY (slot_id)    REFERENCES availability_slots(id)
);

-- =============================================================
-- Payments
-- =============================================================

CREATE TABLE payments (
    id                   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    booking_id           UNIQUEIDENTIFIER NOT NULL,
    user_id              UNIQUEIDENTIFIER NOT NULL,
    expert_id            UNIQUEIDENTIFIER NOT NULL,
    amount               INT              NOT NULL CHECK (amount > 0),  -- VND
    status               NVARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    sepay_order_id       NVARCHAR(255)    NOT NULL DEFAULT '',
    sepay_transaction_id NVARCHAR(255)    NOT NULL DEFAULT '',
    sepay_qr_code        NVARCHAR(MAX)    NULL,
    bank_account         NVARCHAR(MAX)    NULL,                         -- JSON
    transfer_code        NVARCHAR(100)    NULL,
    expires_at           DATETIME2        NULL,
    paid_at              DATETIME2        NULL,
    refund_amount        INT              NOT NULL DEFAULT 0,           -- VND
    refunded_at          DATETIME2        NULL,
    created_at           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT uq_payments_booking UNIQUE (booking_id),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE NO ACTION,
    CONSTRAINT fk_payments_user    FOREIGN KEY (user_id)    REFERENCES users(id),
    CONSTRAINT fk_payments_expert  FOREIGN KEY (expert_id)  REFERENCES experts(id),
    CONSTRAINT chk_payments_status CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    CONSTRAINT chk_payments_refund CHECK (refund_amount >= 0)
);

CREATE UNIQUE INDEX uq_payments_sepay_transaction_id
    ON payments (sepay_transaction_id)
    WHERE sepay_transaction_id IS NOT NULL AND sepay_transaction_id <> '';

-- =============================================================
-- Payouts  (expert withdrawal requests)
-- =============================================================

CREATE TABLE payouts (
    id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    expert_id    UNIQUEIDENTIFIER NOT NULL,
    amount       INT              NOT NULL CHECK (amount > 0),  -- VND
    status       NVARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    bank_account NVARCHAR(MAX)    NOT NULL DEFAULT '{}',        -- JSON
    admin_note   NVARCHAR(MAX)    NULL,
    requested_at DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    processed_at DATETIME2        NULL,
    CONSTRAINT fk_payouts_expert  FOREIGN KEY (expert_id) REFERENCES experts(id),
    CONSTRAINT chk_payouts_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID'))
);

-- =============================================================
-- Reviews  (submit within 7 days of COMPLETED)
-- =============================================================

CREATE TABLE reviews (
    id          UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    booking_id  UNIQUEIDENTIFIER NOT NULL,
    reviewer_id UNIQUEIDENTIFIER NOT NULL,
    expert_id   UNIQUEIDENTIFIER NOT NULL,
    rating      INT              NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     NVARCHAR(MAX)    NOT NULL DEFAULT '',
    is_public   BIT              NOT NULL DEFAULT 1,
    created_at  DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at  DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT uq_reviews_booking  UNIQUE (booking_id),
    CONSTRAINT fk_reviews_booking  FOREIGN KEY (booking_id)  REFERENCES bookings(id),
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_reviews_expert   FOREIGN KEY (expert_id)   REFERENCES experts(id)
);

CREATE INDEX ix_reviews_expert ON reviews (expert_id);

-- =============================================================
-- Notifications
-- =============================================================

CREATE TABLE notifications (
    id                 UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    user_id            UNIQUEIDENTIFIER NOT NULL,
    type               NVARCHAR(50)     NOT NULL,
    title              NVARCHAR(255)    NOT NULL DEFAULT '',
    message            NVARCHAR(MAX)    NOT NULL DEFAULT '',
    is_read            BIT              NOT NULL DEFAULT 0,
    related_booking_id UNIQUEIDENTIFIER NULL,
    created_at         DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_notifications_user    FOREIGN KEY (user_id)            REFERENCES users(id),
    CONSTRAINT fk_notifications_booking FOREIGN KEY (related_booking_id) REFERENCES bookings(id)
);

CREATE INDEX ix_notifications_user_unread ON notifications (user_id, is_read);

-- =============================================================
-- Files  (Azure Blob Storage references)
-- =============================================================

CREATE TABLE uploaded_files (
    id                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    uploaded_by       UNIQUEIDENTIFIER NOT NULL,
    original_filename NVARCHAR(255)    NOT NULL DEFAULT '',
    stored_name       NVARCHAR(512)    NOT NULL DEFAULT '',
    blob_path         NVARCHAR(1024)   NOT NULL DEFAULT '',
    blob_url          NVARCHAR(2048)   NOT NULL DEFAULT '',
    container         NVARCHAR(100)    NOT NULL DEFAULT '',
    purpose           NVARCHAR(50)     NOT NULL DEFAULT '',
    content_type      NVARCHAR(100)    NOT NULL DEFAULT '',
    size_bytes        BIGINT           NOT NULL DEFAULT 0,
    checksum          NVARCHAR(64)     NOT NULL DEFAULT '',
    confirmed         BIT              NOT NULL DEFAULT 0,
    created_at        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    deleted_at        DATETIME2        NULL,
    CONSTRAINT fk_uploaded_files_user     FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT chk_uploaded_files_purpose CHECK (purpose IN (
        'avatar', 'booking_document', 'expert_certificate', 'portfolio', 'admin_document'
    ))
);

-- =============================================================
-- Audit logs  (hard requirement: all critical state transitions)
-- =============================================================

CREATE TABLE audit_logs (
    id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    actor_id       UNIQUEIDENTIFIER NULL,                -- NULL = system
    actor_role     NVARCHAR(20)     NOT NULL DEFAULT '', -- 'user' | 'expert' | 'admin' | 'system'
    action         NVARCHAR(100)    NOT NULL,
    target_type    NVARCHAR(100)    NOT NULL,
    target_id      NVARCHAR(36)     NOT NULL,            -- UUID as string
    previous_state NVARCHAR(MAX)    NULL,                -- JSON snapshot
    new_state      NVARCHAR(MAX)    NULL,                -- JSON snapshot
    note           NVARCHAR(MAX)    NULL,
    ip_address     NVARCHAR(45)     NOT NULL DEFAULT '',
    created_at     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX ix_audit_logs_entity ON audit_logs (target_type, target_id);
CREATE INDEX ix_audit_logs_actor  ON audit_logs (actor_id);
CREATE INDEX ix_audit_logs_time   ON audit_logs (created_at);
