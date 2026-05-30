-- =============================================================
-- MicroMentor — seed data (development / staging only)
-- Run after 01-init.sql.
-- =============================================================

-- =============================================================
-- Users
-- =============================================================

-- Admin
INSERT INTO users (firebase_uid, email, full_name, is_staff, is_superuser, is_active, profile_completed)
VALUES ('BgWG5H6tYKZ5P8VYB969FEG4v5H2', 'admin@gmail.com', N'Quản trị viên', 1, 1, 1, 1);

-- Regular users
INSERT INTO users (firebase_uid, email, full_name, phone_number, timezone, is_active, profile_completed)
VALUES
    ('j9Gbjzl9LPayL10465ijmC0jlqY2', 'user1@gmail.com', N'Nguyễn Văn An',    '0901111111', 'Asia/Ho_Chi_Minh', 1, 1),
    ('7aKAmuSzSHfruLkQycVomUmymDb2', 'user2@gmail.com', N'Trần Thị Bình',    '0902222222', 'Asia/Ho_Chi_Minh', 1, 1),
    ('dlllOCNri3VqQ71WO8CeVuI6fnh1', 'user3@gmail.com', N'Lê Văn Cường',     '0903333333', 'Asia/Ho_Chi_Minh', 1, 1),
    ('qdlpX6WXZVMCmIV7VR3L5YvQGPA3', 'user4@gmail.com', N'Phạm Thị Dung',    '0904444444', 'Asia/Ho_Chi_Minh', 1, 1),
    ('z2LJKgpMQ3a419VQ6VJ6wkx8pQD2', 'user5@gmail.com', N'Hoàng Văn Em',     '0905555555', 'Asia/Ho_Chi_Minh', 1, 0);

-- Expert users
INSERT INTO users (firebase_uid, email, full_name, phone_number, timezone, is_active, profile_completed)
VALUES
    ('bfwH2mR1tDVGLJIcKGXJWDuRhTs1', 'expert1@gmail.com',  N'Phạm Minh Đức',    '0911111111', 'Asia/Ho_Chi_Minh', 1, 1),
    ('UuzotFZK8QUbKfqd3oAYSvQwqkO2', 'expert2@gmail.com',  N'Hoàng Thị Lan',    '0912222222', 'Asia/Ho_Chi_Minh', 1, 1),
    ('FTHfuyWJxFVT8mYKwupfS5u0G6R2', 'expert3@gmail.com',  N'Vũ Quốc Hùng',     '0913333333', 'Asia/Ho_Chi_Minh', 1, 1),
    ('iE84V61tCIgVqbSmRu3mLmsZ4XS2', 'expert4@gmail.com',  N'Nguyễn Thị Mai',   '0914444444', 'Asia/Ho_Chi_Minh', 1, 1),
    ('ycG80Dcs0BRq4mTzMmfKW1GNX8d2', 'expert5@gmail.com',  N'Trần Đình Nam',    '0915555555', 'Asia/Ho_Chi_Minh', 1, 1),
    ('sOhvwTcGfRhzuk9yHDciZfvMK4u1', 'expert6@gmail.com',  N'Lê Thị Oanh',      '0916666666', 'Asia/Ho_Chi_Minh', 1, 1),
    ('Kv8HcwQBIibM0N5zBZjKTpivGJe2', 'expert7@gmail.com',  N'Đặng Văn Phúc',    '0917777777', 'Asia/Ho_Chi_Minh', 1, 1),
    ('9X5dS1jS4ahTy13pq0JEonRchQO2', 'expert8@gmail.com',  N'Bùi Thị Quỳnh',    '0918888888', 'Asia/Ho_Chi_Minh', 1, 1),
    ('2Kc2qBD05RSqhprtmb7BaieMoSf2', 'expert9@gmail.com',  N'Đinh Văn Sơn',     '0919999999', 'Asia/Ho_Chi_Minh', 1, 1),
    ('NPvU0nbwNlWydu3NLpJw2oxzhMf1', 'expert10@gmail.com', N'Cao Thị Thu',      '0920000000', 'Asia/Ho_Chi_Minh', 1, 1);

-- =============================================================
-- Experts
-- =============================================================

INSERT INTO experts (
    user_id, slug, display_name, title, company, bio, category,
    skills, languages, years_of_experience, price_per_session,
    session_duration_minutes, rating, review_count, total_sessions,
    linkedin_url, is_available, profile_status, submitted_at, reviewed_at
)
VALUES
-- expert1: Software Engineering
(
    (SELECT id FROM users WHERE email = 'expert1@gmail.com'),
    'pham-minh-duc',
    N'Phạm Minh Đức',
    N'Senior Software Engineer',
    N'TechCorp Vietnam',
    N'Senior Software Engineer với 8 năm kinh nghiệm backend Python/Django và kiến trúc hệ thống phân tán. Đã dẫn dắt nhiều dự án từ startup đến enterprise.',
    'Software Engineering',
    '["Python", "Django", "PostgreSQL", "Docker", "AWS", "System Design", "Microservices"]',
    '["Tiếng Việt", "English"]',
    8, 500000, 60, 4.80, 24, 30,
    'https://linkedin.com/in/pham-minh-duc',
    1, 'APPROVED',
    DATEADD(DAY, -60, GETUTCDATE()), DATEADD(DAY, -58, GETUTCDATE())
),
-- expert2: Data Science
(
    (SELECT id FROM users WHERE email = 'expert2@gmail.com'),
    'hoang-thi-lan',
    N'Hoàng Thị Lan',
    N'Senior Data Scientist',
    N'AI Solutions',
    N'Data Scientist với 6 năm kinh nghiệm Machine Learning và AI. Chuyên triển khai mô hình ML trong production, xây dựng data pipeline và tư vấn chiến lược dữ liệu.',
    'Data Science',
    '["Python", "TensorFlow", "PyTorch", "SQL", "Apache Spark", "MLOps", "Scikit-learn"]',
    '["Tiếng Việt", "English"]',
    6, 600000, 60, 4.90, 18, 22,
    'https://linkedin.com/in/hoang-thi-lan',
    1, 'APPROVED',
    DATEADD(DAY, -45, GETUTCDATE()), DATEADD(DAY, -43, GETUTCDATE())
),
-- expert3: Product Management
(
    (SELECT id FROM users WHERE email = 'expert3@gmail.com'),
    'vu-quoc-hung',
    N'Vũ Quốc Hùng',
    N'Senior Product Manager',
    N'StartupVN',
    N'Product Manager 10 năm kinh nghiệm xây dựng sản phẩm 0→1. Mentor cho các startup về chiến lược sản phẩm, OKRs, go-to-market và huy động vốn Series A.',
    'Product Management',
    '["Product Strategy", "Agile/Scrum", "OKRs", "User Research", "Roadmapping", "Go-to-market", "Fundraising"]',
    '["Tiếng Việt"]',
    10, 700000, 60, 4.70, 35, 48,
    'https://linkedin.com/in/vu-quoc-hung',
    1, 'APPROVED',
    DATEADD(DAY, -90, GETUTCDATE()), DATEADD(DAY, -88, GETUTCDATE())
),
-- expert4: UX/UI Design
(
    (SELECT id FROM users WHERE email = 'expert4@gmail.com'),
    'nguyen-thi-mai',
    N'Nguyễn Thị Mai',
    N'Lead UX/UI Designer',
    N'DesignHub',
    N'Lead UX/UI Designer 7 năm kinh nghiệm thiết kế sản phẩm số. Chuyên về design systems, user research và prototyping. Đã làm việc với các thương hiệu lớn tại VN và quốc tế.',
    'UX/UI Design',
    '["Figma", "User Research", "Design Systems", "Prototyping", "Usability Testing", "Adobe XD", "Motion Design"]',
    '["Tiếng Việt", "English"]',
    7, 450000, 60, 4.85, 20, 27,
    'https://linkedin.com/in/nguyen-thi-mai',
    1, 'APPROVED',
    DATEADD(DAY, -30, GETUTCDATE()), DATEADD(DAY, -28, GETUTCDATE())
),
-- expert5: Marketing
(
    (SELECT id FROM users WHERE email = 'expert5@gmail.com'),
    'tran-dinh-nam',
    N'Trần Đình Nam',
    N'Growth Marketing Manager',
    N'GrowthLab',
    N'Growth Marketing Manager 9 năm kinh nghiệm digital marketing, performance marketing và brand building. Đã giúp hơn 30 doanh nghiệp tăng trưởng doanh thu qua chiến lược marketing.',
    'Marketing',
    '["Growth Hacking", "Performance Marketing", "SEO/SEM", "Content Marketing", "Social Media", "Email Marketing", "Analytics"]',
    '["Tiếng Việt"]',
    9, 400000, 60, 4.60, 29, 40,
    'https://linkedin.com/in/tran-dinh-nam',
    1, 'APPROVED',
    DATEADD(DAY, -50, GETUTCDATE()), DATEADD(DAY, -48, GETUTCDATE())
),
-- expert6: Finance / Investment
(
    (SELECT id FROM users WHERE email = 'expert6@gmail.com'),
    'le-thi-oanh',
    N'Lê Thị Oanh',
    N'Senior Financial Analyst',
    N'VinCapital',
    N'Financial Analyst 8 năm kinh nghiệm phân tích tài chính, định giá doanh nghiệp và tư vấn đầu tư. Chuyên về thị trường chứng khoán VN và quản lý danh mục đầu tư cá nhân.',
    'Finance',
    '["Financial Modeling", "Valuation", "Stock Analysis", "Portfolio Management", "Risk Management", "Excel/VBA", "Power BI"]',
    '["Tiếng Việt"]',
    8, 550000, 60, 4.75, 16, 21,
    'https://linkedin.com/in/le-thi-oanh',
    1, 'APPROVED',
    DATEADD(DAY, -40, GETUTCDATE()), DATEADD(DAY, -38, GETUTCDATE())
),
-- expert7: Entrepreneurship / Startup
(
    (SELECT id FROM users WHERE email = 'expert7@gmail.com'),
    'dang-van-phuc',
    N'Đặng Văn Phúc',
    N'Founder & CEO',
    N'VietStartup',
    N'Serial entrepreneur, đã thành lập và exit 2 startup thành công. Mentor cho hơn 50 startup về chiến lược kinh doanh, xây dựng team, kêu gọi vốn và scaling.',
    'Entrepreneurship',
    '["Business Strategy", "Fundraising", "Team Building", "Lean Startup", "Business Model Canvas", "Pitch Deck", "Scaling"]',
    '["Tiếng Việt", "English"]',
    12, 800000, 60, 4.95, 42, 60,
    'https://linkedin.com/in/dang-van-phuc',
    1, 'APPROVED',
    DATEADD(DAY, -120, GETUTCDATE()), DATEADD(DAY, -118, GETUTCDATE())
),
-- expert8: DevOps / Cloud
(
    (SELECT id FROM users WHERE email = 'expert8@gmail.com'),
    'bui-thi-quynh',
    N'Bùi Thị Quỳnh',
    N'DevOps Engineer',
    N'CloudNative VN',
    N'DevOps Engineer 6 năm kinh nghiệm xây dựng CI/CD pipeline, hạ tầng cloud và Kubernetes. Chuyên tư vấn về cloud migration, infrastructure as code và tối ưu chi phí cloud.',
    'DevOps & Cloud',
    '["Kubernetes", "Docker", "Terraform", "AWS", "GCP", "CI/CD", "Monitoring", "Infrastructure as Code"]',
    '["Tiếng Việt", "English"]',
    6, 500000, 60, 4.80, 14, 18,
    'https://linkedin.com/in/bui-thi-quynh',
    1, 'APPROVED',
    DATEADD(DAY, -25, GETUTCDATE()), DATEADD(DAY, -23, GETUTCDATE())
),
-- expert9: Cybersecurity
(
    (SELECT id FROM users WHERE email = 'expert9@gmail.com'),
    'dinh-van-son',
    N'Đinh Văn Sơn',
    N'Information Security Specialist',
    N'SecureVN',
    N'Security Specialist 7 năm kinh nghiệm an toàn thông tin, penetration testing và bảo mật ứng dụng web. Có chứng chỉ CISSP và CEH. Tư vấn compliance và incident response.',
    'Cybersecurity',
    '["Penetration Testing", "OWASP", "Network Security", "Incident Response", "Compliance (ISO 27001)", "SIEM", "Cloud Security"]',
    '["Tiếng Việt", "English"]',
    7, 650000, 60, 4.85, 12, 16,
    'https://linkedin.com/in/dinh-van-son',
    1, 'APPROVED',
    DATEADD(DAY, -35, GETUTCDATE()), DATEADD(DAY, -33, GETUTCDATE())
),
-- expert10: Machine Learning / AI
(
    (SELECT id FROM users WHERE email = 'expert10@gmail.com'),
    'cao-thi-thu',
    N'Cao Thị Thu',
    N'AI/ML Research Engineer',
    N'VinAI',
    N'AI/ML Research Engineer 5 năm kinh nghiệm nghiên cứu và ứng dụng AI vào thực tiễn. Chuyên về NLP, Computer Vision và LLM fine-tuning. Đã publish 3 paper tại hội nghị quốc tế.',
    'Artificial Intelligence',
    '["Deep Learning", "NLP", "Computer Vision", "LLM Fine-tuning", "Hugging Face", "PyTorch", "Research Methodology"]',
    '["Tiếng Việt", "English"]',
    5, 700000, 60, 4.90, 10, 13,
    'https://linkedin.com/in/cao-thi-thu',
    1, 'APPROVED',
    DATEADD(DAY, -15, GETUTCDATE()), DATEADD(DAY, -13, GETUTCDATE())
);

-- =============================================================
-- Availability slots  (09:00–17:00, next 5 weekdays, 15-min blocks)
-- =============================================================

DECLARE @e1  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'pham-minh-duc');
DECLARE @e2  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'hoang-thi-lan');
DECLARE @e3  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'vu-quoc-hung');
DECLARE @e4  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'nguyen-thi-mai');
DECLARE @e5  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'tran-dinh-nam');
DECLARE @e6  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'le-thi-oanh');
DECLARE @e7  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'dang-van-phuc');
DECLARE @e8  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'bui-thi-quynh');
DECLARE @e9  UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'dinh-van-son');
DECLARE @e10 UNIQUEIDENTIFIER = (SELECT id FROM experts WHERE slug = 'cao-thi-thu');

DECLARE @day INT = 1;

WHILE @day <= 7
BEGIN
    DECLARE @base DATETIME2 = DATEADD(DAY, @day, CAST(CAST(GETUTCDATE() AS DATE) AS DATETIME2));
    BEGIN
        DECLARE @hour   INT = 9;
        DECLARE @minute INT;
        DECLARE @slot   DATETIME2;

        WHILE @hour < 23
        BEGIN
            SET @minute = 0;
            WHILE @minute < 60
            BEGIN
                SET @slot = DATEADD(MINUTE, @minute, DATEADD(HOUR, @hour, @base));

                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e1,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e2,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e3,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e4,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e5,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e6,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e7,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e8,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e9,  @slot);
                INSERT INTO availability_slots (expert_id, start_time) VALUES (@e10, @slot);

                SET @minute = @minute + 15;
            END
            SET @hour = @hour + 1;
        END
    END
    SET @day = @day + 1;
END

-- =============================================================
-- Sample bookings (one per user, various states)
-- =============================================================

DECLARE @u1 UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'user1@gmail.com');
DECLARE @u2 UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'user2@gmail.com');
DECLARE @u3 UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'user3@gmail.com');
DECLARE @u4 UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'user4@gmail.com');

DECLARE @b1 UNIQUEIDENTIFIER = NEWID();
DECLARE @b2 UNIQUEIDENTIFIER = NEWID();
DECLARE @b3 UNIQUEIDENTIFIER = NEWID();
DECLARE @b4 UNIQUEIDENTIFIER = NEWID();

-- Booking 1: COMPLETED  (user1 → expert1)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    scheduled_at, duration_minutes, price_vnd, agora_channel, created_at, updated_at)
VALUES (
    @b1, @u1, @e1, 'COMPLETED',
    N'Tôi cần tư vấn về kiến trúc microservices cho hệ thống thương mại điện tử đang phát triển.',
    N'Hiểu rõ trade-off giữa monolith và microservices, lộ trình migration phù hợp.',
    DATEADD(DAY, -5, GETUTCDATE()), 60, 500000,
    'ch-b1-demo', DATEADD(DAY, -7, GETUTCDATE()), DATEADD(DAY, -5, GETUTCDATE())
);

-- Booking 2: PAID_CONFIRMED  (user2 → expert2)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    scheduled_at, duration_minutes, price_vnd, payment_deadline, agora_channel, created_at, updated_at)
VALUES (
    @b2, @u2, @e2, 'PAID_CONFIRMED',
    N'Tôi muốn tìm hiểu cách xây dựng data pipeline từ đầu cho startup của mình.',
    N'Hiểu các công cụ ETL phù hợp và cách lựa chọn stack dữ liệu tiết kiệm chi phí.',
    DATEADD(DAY, 2, GETUTCDATE()), 60, 600000,
    DATEADD(DAY, 1, GETUTCDATE()), 'ch-b2-demo',
    DATEADD(DAY, -2, GETUTCDATE()), DATEADD(DAY, -1, GETUTCDATE())
);

-- Booking 3: PENDING_APPROVAL  (user3 → expert3)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    duration_minutes, price_vnd, expert_response_deadline, created_at, updated_at)
VALUES (
    @b3, @u3, @e3, 'PENDING_APPROVAL',
    N'Startup của tôi đang chuẩn bị pitch cho nhà đầu tư Series A, cần tư vấn về deck và chiến lược.',
    N'Hoàn thiện pitch deck, hiểu kỳ vọng của VC và chuẩn bị cho Q&A.',
    60, 700000,
    DATEADD(HOUR, 20, GETUTCDATE()),
    DATEADD(HOUR, -4, GETUTCDATE()), DATEADD(HOUR, -4, GETUTCDATE())
);

-- Booking 4: APPROVED_AWAITING_PAYMENT  (user4 → expert7)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    scheduled_at, duration_minutes, price_vnd, payment_deadline, agora_channel, created_at, updated_at)
VALUES (
    @b4, @u4, @e7, 'APPROVED_AWAITING_PAYMENT',
    N'Tôi muốn tư vấn về cách xây dựng MVP và validate idea trước khi đầu tư nhiều nguồn lực.',
    N'Có framework validate idea, biết cách xây dựng MVP nhanh và đo lường hiệu quả.',
    DATEADD(DAY, 3, GETUTCDATE()), 60, 800000,
    DATEADD(HOUR, 18, GETUTCDATE()), 'ch-b4-demo',
    DATEADD(HOUR, -2, GETUTCDATE()), DATEADD(HOUR, -1, GETUTCDATE())
);

-- =============================================================
-- Payments
-- =============================================================

INSERT INTO payments (booking_id, user_id, expert_id, amount, status, paid_at)
VALUES (@b1, @u1, @e1, 500000, 'PAID', DATEADD(DAY, -6, GETUTCDATE()));

INSERT INTO payments (booking_id, user_id, expert_id, amount, status, paid_at)
VALUES (@b2, @u2, @e2, 600000, 'PAID', DATEADD(DAY, -1, GETUTCDATE()));

INSERT INTO payments (booking_id, user_id, expert_id, amount, status, expires_at)
VALUES (@b4, @u4, @e7, 800000, 'PENDING', DATEADD(HOUR, 18, GETUTCDATE()));

-- =============================================================
-- Reviews  (for completed booking only)
-- =============================================================

INSERT INTO reviews (booking_id, reviewer_id, expert_id, rating, comment)
VALUES (
    @b1, @u1, @e1, 5,
    N'Anh Đức tư vấn rất rõ ràng và sâu sắc. Tôi đã hiểu được lộ trình migration hợp lý cho dự án. Highly recommend!'
);

-- =============================================================
-- Notifications
-- =============================================================

DECLARE @expert1_user_id UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert1@gmail.com');

INSERT INTO notifications (user_id, type, title, message, is_read, related_booking_id)
VALUES
    (@u1, 'BOOKING_COMPLETED',         N'Buổi tư vấn hoàn thành',          N'Buổi tư vấn với Phạm Minh Đức đã kết thúc. Hãy để lại đánh giá!',          1, @b1),
    (@u2, 'BOOKING_CONFIRMED',         N'Thanh toán thành công',            N'Đặt lịch tư vấn với Hoàng Thị Lan đã được xác nhận.',                       0, @b2),
    (@u3, 'BOOKING_PENDING_APPROVAL',  N'Chờ chuyên gia xác nhận',         N'Vũ Quốc Hùng có 24 giờ để phản hồi yêu cầu của bạn.',                       0, @b3),
    (@u4, 'PAYMENT_REQUIRED',          N'Vui lòng hoàn tất thanh toán',     N'Lịch tư vấn đã được duyệt. Thanh toán trước 18 giờ để giữ lịch.',           0, @b4),
    (@expert1_user_id, 'NEW_REVIEW',   N'Bạn nhận được đánh giá mới',      N'Nguyễn Văn An đã đánh giá buổi tư vấn 5 sao. Xem ngay!',                    0, @b1);

-- =============================================================
-- Additional bookings  (remaining status states)
-- =============================================================

DECLARE @u5 UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'user5@gmail.com');

DECLARE @b5  UNIQUEIDENTIFIER = NEWID();   -- COMPLETED          user1  → expert4  (UX/UI)
DECLARE @b6  UNIQUEIDENTIFIER = NEWID();   -- REJECTED           user2  → expert5  (Marketing)
DECLARE @b7  UNIQUEIDENTIFIER = NEWID();   -- CANCELLED_BY_USER  user3  → expert6  (Finance, 50% refund)
DECLARE @b8  UNIQUEIDENTIFIER = NEWID();   -- NO_SHOW_EXPERT     user4  → expert8  (DevOps, 100% refund)
DECLARE @b9  UNIQUEIDENTIFIER = NEWID();   -- IN_PROGRESS        user5  → expert9  (Cybersecurity)
DECLARE @b10 UNIQUEIDENTIFIER = NEWID();   -- EXPIRED_UNPAID     user5  → expert10 (AI/ML)

-- Booking 5: COMPLETED  (user1 → expert4, UX design review)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    scheduled_at, duration_minutes, price_vnd, agora_channel, created_at, updated_at)
VALUES (
    @b5, @u1, @e4, 'COMPLETED',
    N'Tôi cần review thiết kế UI/UX của ứng dụng mobile trước khi ra mắt phiên bản beta.',
    N'Nhận phản hồi về luồng người dùng, tính nhất quán của design system và accessibility.',
    DATEADD(DAY, -3, GETUTCDATE()), 60, 450000,
    'ch-b5-demo', DATEADD(DAY, -5, GETUTCDATE()), DATEADD(DAY, -3, GETUTCDATE())
);

-- Booking 6: REJECTED  (user2 → expert5, Marketing)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    duration_minutes, price_vnd, rejection_reason, created_at, updated_at)
VALUES (
    @b6, @u2, @e5, 'REJECTED',
    N'Tôi muốn tư vấn về chiến lược content marketing cho kênh TikTok của thương hiệu F&B.',
    N'Xây dựng content calendar hiệu quả, tăng lượt follow và chuyển đổi thành khách hàng.',
    60, 400000,
    N'Yêu cầu không thuộc lĩnh vực tôi có thể tư vấn chuyên sâu. Vui lòng tìm chuyên gia về Social Media.',
    DATEADD(DAY, -4, GETUTCDATE()), DATEADD(DAY, -3, GETUTCDATE())
);

-- Booking 7: CANCELLED_BY_USER  (user3 → expert6, Finance — 50% refund applied)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    scheduled_at, duration_minutes, price_vnd, agora_channel, created_at, updated_at)
VALUES (
    @b7, @u3, @e6, 'CANCELLED_BY_USER',
    N'Tôi cần tư vấn về cách phân tích và lựa chọn cổ phiếu cho danh mục đầu tư cá nhân dài hạn.',
    N'Hiểu phương pháp định giá cổ phiếu, xây dựng danh mục phù hợp khẩu vị rủi ro.',
    DATEADD(DAY, 5, GETUTCDATE()), 60, 550000,
    'ch-b7-demo', DATEADD(DAY, -6, GETUTCDATE()), DATEADD(DAY, -1, GETUTCDATE())
);

-- Booking 8: NO_SHOW_EXPERT  (user4 → expert8, DevOps — 100% refund)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    scheduled_at, duration_minutes, price_vnd, agora_channel, created_at, updated_at)
VALUES (
    @b8, @u4, @e8, 'NO_SHOW_EXPERT',
    N'Cần hỗ trợ thiết kế CI/CD pipeline cho dự án Node.js triển khai trên AWS ECS.',
    N'Có pipeline hoàn chỉnh từ git push đến deploy production với zero-downtime.',
    DATEADD(DAY, -1, GETUTCDATE()), 60, 500000,
    'ch-b8-demo', DATEADD(DAY, -8, GETUTCDATE()), DATEADD(DAY, -1, GETUTCDATE())
);

-- Booking 9: IN_PROGRESS  (user5 → expert9, Cybersecurity — happening now)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    scheduled_at, duration_minutes, price_vnd, agora_channel, created_at, updated_at)
VALUES (
    @b9, @u5, @e9, 'IN_PROGRESS',
    N'Ứng dụng web của tôi bị tấn công SQL Injection. Cần tư vấn khắc phục và bảo mật toàn diện.',
    N'Vá lỗ hổng hiện tại, hiểu nguyên nhân gốc rễ và lộ trình bảo mật ứng dụng theo OWASP.',
    GETUTCDATE(), 60, 650000,
    'ch-b9-live', DATEADD(DAY, -2, GETUTCDATE()), GETUTCDATE()
);

-- Booking 10: EXPIRED_UNPAID  (user5 → expert10, AI/ML — payment window missed)
INSERT INTO bookings (id, user_id, expert_id, status, problem_description, session_goals,
    scheduled_at, duration_minutes, price_vnd, payment_deadline, agora_channel, created_at, updated_at)
VALUES (
    @b10, @u5, @e10, 'EXPIRED_UNPAID',
    N'Tôi muốn học cách fine-tune mô hình LLaMA cho bài toán phân tích cảm xúc tiếng Việt.',
    N'Hiểu quy trình fine-tuning, chuẩn bị dataset và đánh giá chất lượng mô hình.',
    DATEADD(DAY, 1, GETUTCDATE()), 60, 700000,
    DATEADD(HOUR, -2, GETUTCDATE()), 'ch-b10-demo',
    DATEADD(DAY, -2, GETUTCDATE()), DATEADD(HOUR, -2, GETUTCDATE())
);

-- =============================================================
-- Additional payments
-- =============================================================

-- Booking 5: COMPLETED → PAID
INSERT INTO payments (booking_id, user_id, expert_id, amount, status, paid_at)
VALUES (@b5, @u1, @e4, 450000, 'PAID', DATEADD(DAY, -4, GETUTCDATE()));

-- Booking 7: CANCELLED_BY_USER → REFUNDED (50%)
INSERT INTO payments (booking_id, user_id, expert_id, amount, status,
    paid_at, refund_amount, refunded_at)
VALUES (@b7, @u3, @e6, 550000, 'REFUNDED',
    DATEADD(DAY, -5, GETUTCDATE()), 275000, DATEADD(HOUR, -20, GETUTCDATE()));

-- Booking 8: NO_SHOW_EXPERT → REFUNDED (100%)
INSERT INTO payments (booking_id, user_id, expert_id, amount, status,
    paid_at, refund_amount, refunded_at)
VALUES (@b8, @u4, @e8, 500000, 'REFUNDED',
    DATEADD(DAY, -7, GETUTCDATE()), 500000, DATEADD(HOUR, -12, GETUTCDATE()));

-- Booking 9: IN_PROGRESS → PAID
INSERT INTO payments (booking_id, user_id, expert_id, amount, status, paid_at)
VALUES (@b9, @u5, @e9, 650000, 'PAID', DATEADD(DAY, -1, GETUTCDATE()));

-- Booking 10: EXPIRED_UNPAID → FAILED (never paid, deadline passed)
INSERT INTO payments (booking_id, user_id, expert_id, amount, status, expires_at)
VALUES (@b10, @u5, @e10, 700000, 'FAILED', DATEADD(HOUR, -2, GETUTCDATE()));

-- =============================================================
-- Additional reviews  (one per completed booking)
-- =============================================================

INSERT INTO reviews (booking_id, reviewer_id, expert_id, rating, comment)
VALUES (
    @b5, @u1, @e4, 4,
    N'Chị Mai có nhiều kinh nghiệm thực tế và đưa ra phản hồi rất chi tiết về UI. Chỉ cần thêm thời gian để đi sâu hơn vào accessibility.'
);

-- =============================================================
-- Additional notifications
-- =============================================================

DECLARE @exp4_uid  UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert4@gmail.com');
DECLARE @exp5_uid  UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert5@gmail.com');
DECLARE @exp6_uid  UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert6@gmail.com');
DECLARE @exp8_uid  UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert8@gmail.com');
DECLARE @exp9_uid  UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert9@gmail.com');
DECLARE @exp10_uid UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert10@gmail.com');

INSERT INTO notifications (user_id, type, title, message, is_read, related_booking_id)
VALUES
    -- Booking 5: COMPLETED
    (@u1,       'BOOKING_COMPLETED',    N'Buổi tư vấn hoàn thành',        N'Buổi tư vấn với Nguyễn Thị Mai đã kết thúc. Hãy để lại đánh giá!',          0, @b5),
    (@exp4_uid, 'NEW_REVIEW',           N'Bạn nhận được đánh giá mới',    N'Nguyễn Văn An đã đánh giá buổi tư vấn 4 sao.',                              0, @b5),
    -- Booking 6: REJECTED
    (@u2,       'BOOKING_REJECTED',     N'Yêu cầu bị từ chối',            N'Trần Đình Nam đã từ chối yêu cầu tư vấn của bạn. Xem lý do.',                1, @b6),
    -- Booking 7: CANCELLED + REFUND
    (@u3,       'BOOKING_CANCELLED',    N'Đặt lịch đã được huỷ',          N'Bạn đã huỷ buổi tư vấn với Lê Thị Oanh. Hoàn tiền 50% đang xử lý.',        0, @b7),
    (@u3,       'REFUND_PROCESSED',     N'Hoàn tiền thành công',           N'275.000 ₫ đã được hoàn vào tài khoản của bạn.',                              0, @b7),
    -- Booking 8: NO_SHOW_EXPERT + REFUND
    (@u4,       'BOOKING_NO_SHOW',      N'Chuyên gia không tham gia',     N'Bùi Thị Quỳnh đã không tham gia buổi tư vấn. Hoàn tiền 100% đang xử lý.',  0, @b8),
    (@u4,       'REFUND_PROCESSED',     N'Hoàn tiền thành công',           N'500.000 ₫ đã được hoàn vào tài khoản của bạn.',                              0, @b8),
    -- Booking 9: IN_PROGRESS
    (@u5,       'BOOKING_CONFIRMED',    N'Buổi tư vấn đang diễn ra',      N'Buổi tư vấn với Đinh Văn Sơn đang bắt đầu. Tham gia ngay!',                 0, @b9),
    -- Booking 10: EXPIRED_UNPAID
    (@u5,       'BOOKING_EXPIRED',      N'Đặt lịch đã hết hạn',           N'Bạn đã không thanh toán đúng hạn. Vui lòng đặt lại lịch với Cao Thị Thu.', 0, @b10);

-- =============================================================
-- Additional audit logs
-- =============================================================

INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, previous_state, new_state)
VALUES
    -- Booking 5: COMPLETED
    (@u1,       'user',   'booking.created',         'booking', CAST(@b5 AS NVARCHAR(36)), NULL,                                    '{"status":"DRAFT"}'),
    (@u1,       'user',   'booking.submitted',       'booking', CAST(@b5 AS NVARCHAR(36)), '{"status":"DRAFT"}',                    '{"status":"PENDING_APPROVAL"}'),
    (@exp4_uid, 'expert', 'booking.approved',        'booking', CAST(@b5 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',         '{"status":"APPROVED_AWAITING_PAYMENT"}'),
    (@u1,       'user',   'payment.paid',            'booking', CAST(@b5 AS NVARCHAR(36)), '{"status":"APPROVED_AWAITING_PAYMENT"}', '{"status":"PAID_CONFIRMED"}'),
    (NULL,      'system', 'booking.session_started', 'booking', CAST(@b5 AS NVARCHAR(36)), '{"status":"PAID_CONFIRMED"}',           '{"status":"IN_PROGRESS"}'),
    (NULL,      'system', 'booking.completed',       'booking', CAST(@b5 AS NVARCHAR(36)), '{"status":"IN_PROGRESS"}',              '{"status":"COMPLETED"}'),
    -- Booking 6: REJECTED
    (@u2,       'user',   'booking.created',         'booking', CAST(@b6 AS NVARCHAR(36)), NULL,                                    '{"status":"DRAFT"}'),
    (@u2,       'user',   'booking.submitted',       'booking', CAST(@b6 AS NVARCHAR(36)), '{"status":"DRAFT"}',                    '{"status":"PENDING_APPROVAL"}'),
    (@exp5_uid, 'expert', 'booking.rejected',        'booking', CAST(@b6 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',         '{"status":"REJECTED"}'),
    -- Booking 7: CANCELLED_BY_USER + REFUNDED
    (@u3,       'user',   'booking.created',         'booking', CAST(@b7 AS NVARCHAR(36)), NULL,                                    '{"status":"DRAFT"}'),
    (@u3,       'user',   'booking.submitted',       'booking', CAST(@b7 AS NVARCHAR(36)), '{"status":"DRAFT"}',                    '{"status":"PENDING_APPROVAL"}'),
    (@exp6_uid, 'expert', 'booking.approved',        'booking', CAST(@b7 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',         '{"status":"APPROVED_AWAITING_PAYMENT"}'),
    (@u3,       'user',   'payment.paid',            'booking', CAST(@b7 AS NVARCHAR(36)), '{"status":"APPROVED_AWAITING_PAYMENT"}', '{"status":"PAID_CONFIRMED"}'),
    (@u3,       'user',   'booking.cancelled_user',  'booking', CAST(@b7 AS NVARCHAR(36)), '{"status":"PAID_CONFIRMED"}',           '{"status":"CANCELLED_BY_USER"}'),
    (NULL,      'system', 'payment.refunded',        'booking', CAST(@b7 AS NVARCHAR(36)), '{"refund_amount":0}',                   '{"refund_amount":275000}'),
    -- Booking 8: NO_SHOW_EXPERT + REFUNDED
    (@u4,       'user',   'booking.created',         'booking', CAST(@b8 AS NVARCHAR(36)), NULL,                                    '{"status":"DRAFT"}'),
    (@u4,       'user',   'booking.submitted',       'booking', CAST(@b8 AS NVARCHAR(36)), '{"status":"DRAFT"}',                    '{"status":"PENDING_APPROVAL"}'),
    (@exp8_uid, 'expert', 'booking.approved',        'booking', CAST(@b8 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',         '{"status":"APPROVED_AWAITING_PAYMENT"}'),
    (@u4,       'user',   'payment.paid',            'booking', CAST(@b8 AS NVARCHAR(36)), '{"status":"APPROVED_AWAITING_PAYMENT"}', '{"status":"PAID_CONFIRMED"}'),
    (NULL,      'system', 'booking.session_started', 'booking', CAST(@b8 AS NVARCHAR(36)), '{"status":"PAID_CONFIRMED"}',           '{"status":"IN_PROGRESS"}'),
    (NULL,      'system', 'booking.no_show_expert',  'booking', CAST(@b8 AS NVARCHAR(36)), '{"status":"IN_PROGRESS"}',              '{"status":"NO_SHOW_EXPERT"}'),
    (NULL,      'system', 'payment.refunded',        'booking', CAST(@b8 AS NVARCHAR(36)), '{"refund_amount":0}',                   '{"refund_amount":500000}'),
    -- Booking 9: IN_PROGRESS
    (@u5,       'user',   'booking.created',         'booking', CAST(@b9 AS NVARCHAR(36)), NULL,                                    '{"status":"DRAFT"}'),
    (@u5,       'user',   'booking.submitted',       'booking', CAST(@b9 AS NVARCHAR(36)), '{"status":"DRAFT"}',                    '{"status":"PENDING_APPROVAL"}'),
    (@exp9_uid, 'expert', 'booking.approved',        'booking', CAST(@b9 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',         '{"status":"APPROVED_AWAITING_PAYMENT"}'),
    (@u5,       'user',   'payment.paid',            'booking', CAST(@b9 AS NVARCHAR(36)), '{"status":"APPROVED_AWAITING_PAYMENT"}', '{"status":"PAID_CONFIRMED"}'),
    (NULL,      'system', 'booking.session_started', 'booking', CAST(@b9 AS NVARCHAR(36)), '{"status":"PAID_CONFIRMED"}',           '{"status":"IN_PROGRESS"}'),
    -- Booking 10: EXPIRED_UNPAID
    (@u5,       'user',   'booking.created',         'booking', CAST(@b10 AS NVARCHAR(36)), NULL,                                   '{"status":"DRAFT"}'),
    (@u5,       'user',   'booking.submitted',       'booking', CAST(@b10 AS NVARCHAR(36)), '{"status":"DRAFT"}',                   '{"status":"PENDING_APPROVAL"}'),
    (@exp10_uid,'expert', 'booking.approved',        'booking', CAST(@b10 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',        '{"status":"APPROVED_AWAITING_PAYMENT"}'),
    (NULL,      'system', 'booking.expired_unpaid',  'booking', CAST(@b10 AS NVARCHAR(36)), '{"status":"APPROVED_AWAITING_PAYMENT"}','{"status":"EXPIRED_UNPAID"}');

-- =============================================================
-- Uploaded files
-- Covers every purpose category; uses realistic blob paths.
-- container value matches the Azure container name from settings
-- (public / private); no CHECK constraint enforces this in SQL.
-- =============================================================

DECLARE @exp1_uid_files UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert1@gmail.com');
DECLARE @exp2_uid_files UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert2@gmail.com');
DECLARE @exp3_uid_files UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert3@gmail.com');
DECLARE @exp7_uid_files UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert7@gmail.com');
DECLARE @exp9_uid_files UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert9@gmail.com');

-- Avatars (public container, purpose = 'avatar')
INSERT INTO uploaded_files (
    uploaded_by, original_filename, stored_name, blob_path, blob_url,
    container, purpose, content_type, size_bytes, confirmed
)
VALUES
(
    @exp1_uid_files,
    'avatar.jpg',
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4-avatar.jpg',
    'avatars/' + CAST(@exp1_uid_files AS NVARCHAR(36)) + '/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4-avatar.jpg',
    'https://storageaccount.blob.core.windows.net/public/avatars/' + CAST(@exp1_uid_files AS NVARCHAR(36)) + '/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4-avatar.jpg',
    'public', 'avatar', 'image/jpeg', 204800, 1
),
(
    @exp2_uid_files,
    'profile-photo.png',
    'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5-profile-photo.png',
    'avatars/' + CAST(@exp2_uid_files AS NVARCHAR(36)) + '/b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5-profile-photo.png',
    'https://storageaccount.blob.core.windows.net/public/avatars/' + CAST(@exp2_uid_files AS NVARCHAR(36)) + '/b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5-profile-photo.png',
    'public', 'avatar', 'image/png', 358400, 1
);

-- Booking attachments (private container, purpose = 'booking_document')
INSERT INTO uploaded_files (
    uploaded_by, original_filename, stored_name, blob_path, blob_url,
    container, purpose, content_type, size_bytes, confirmed
)
VALUES
(
    @u1,
    'system-architecture.pdf',
    'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6-system-architecture.pdf',
    'booking-attachments/' + CAST(@u1 AS NVARCHAR(36)) + '/c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6-system-architecture.pdf',
    '',
    'private', 'booking_document', 'application/pdf', 1572864, 1
),
(
    @u2,
    'data-pipeline-requirements.pdf',
    'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1-data-pipeline-requirements.pdf',
    'booking-attachments/' + CAST(@u2 AS NVARCHAR(36)) + '/d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1-data-pipeline-requirements.pdf',
    '',
    'private', 'booking_document', 'application/pdf', 2097152, 1
),
(
    @u3,
    'startup-pitch-draft.pptx',
    'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2-startup-pitch-draft.pptx',
    'booking-attachments/' + CAST(@u3 AS NVARCHAR(36)) + '/e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2-startup-pitch-draft.pptx',
    '',
    'private', 'booking_document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    4718592, 1
);

-- Expert certifications (private container, purpose = 'expert_certificate')
INSERT INTO uploaded_files (
    uploaded_by, original_filename, stored_name, blob_path, blob_url,
    container, purpose, content_type, size_bytes, confirmed
)
VALUES
(
    @exp9_uid_files,
    'CISSP-certificate.pdf',
    'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3-cissp-certificate.pdf',
    'certifications/' + CAST(@exp9_uid_files AS NVARCHAR(36)) + '/f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3-cissp-certificate.pdf',
    '',
    'private', 'expert_certificate', 'application/pdf', 1048576, 1
),
(
    @exp9_uid_files,
    'CEH-certificate.pdf',
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d5-ceh-certificate.pdf',
    'certifications/' + CAST(@exp9_uid_files AS NVARCHAR(36)) + '/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d5-ceh-certificate.pdf',
    '',
    'private', 'expert_certificate', 'application/pdf', 819200, 1
);

-- Portfolio files (public container, purpose = 'portfolio')
INSERT INTO uploaded_files (
    uploaded_by, original_filename, stored_name, blob_path, blob_url,
    container, purpose, content_type, size_bytes, confirmed
)
VALUES
(
    @exp3_uid_files,
    'product-portfolio-2025.pdf',
    'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e6-product-portfolio-2025.pdf',
    'portfolio/' + CAST(@exp3_uid_files AS NVARCHAR(36)) + '/b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e6-product-portfolio-2025.pdf',
    'https://storageaccount.blob.core.windows.net/public/portfolio/' + CAST(@exp3_uid_files AS NVARCHAR(36)) + '/b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e6-product-portfolio-2025.pdf',
    'public', 'portfolio', 'application/pdf', 3145728, 1
),
(
    @exp7_uid_files,
    'startup-case-studies.pdf',
    'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f7-startup-case-studies.pdf',
    'portfolio/' + CAST(@exp7_uid_files AS NVARCHAR(36)) + '/c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f7-startup-case-studies.pdf',
    'https://storageaccount.blob.core.windows.net/public/portfolio/' + CAST(@exp7_uid_files AS NVARCHAR(36)) + '/c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f7-startup-case-studies.pdf',
    'public', 'portfolio', 'application/pdf', 5242880, 1
);

-- Admin documents (private container, purpose = 'admin_document')
DECLARE @admin_uid UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'admin@gmail.com');

INSERT INTO uploaded_files (
    uploaded_by, original_filename, stored_name, blob_path, blob_url,
    container, purpose, content_type, size_bytes, confirmed
)
VALUES
(
    @admin_uid,
    'platform-policy-v2.pdf',
    'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a2-platform-policy-v2.pdf',
    'admin-documents/' + CAST(@admin_uid AS NVARCHAR(36)) + '/d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a2-platform-policy-v2.pdf',
    '',
    'private', 'admin_document', 'application/pdf', 524288, 1
);

-- =============================================================
-- Audit logs
-- =============================================================

-- actor_id references users.id, so use user UUIDs for expert actors
DECLARE @exp1_uid UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert1@gmail.com');
DECLARE @exp2_uid UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert2@gmail.com');
DECLARE @exp7_uid UNIQUEIDENTIFIER = (SELECT id FROM users WHERE email = 'expert7@gmail.com');

INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, previous_state, new_state)
VALUES
    -- Booking 1 full lifecycle
    (@u1,       'user',   'booking.created',         'booking', CAST(@b1 AS NVARCHAR(36)), NULL,                                   '{"status":"DRAFT"}'),
    (@u1,       'user',   'booking.submitted',       'booking', CAST(@b1 AS NVARCHAR(36)), '{"status":"DRAFT"}',                   '{"status":"PENDING_APPROVAL"}'),
    (@exp1_uid, 'expert', 'booking.approved',        'booking', CAST(@b1 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',        '{"status":"APPROVED_AWAITING_PAYMENT"}'),
    (@u1,       'user',   'payment.paid',            'booking', CAST(@b1 AS NVARCHAR(36)), '{"status":"APPROVED_AWAITING_PAYMENT"}','{"status":"PAID_CONFIRMED"}'),
    (NULL,      'system', 'booking.session_started', 'booking', CAST(@b1 AS NVARCHAR(36)), '{"status":"PAID_CONFIRMED"}',          '{"status":"IN_PROGRESS"}'),
    (NULL,      'system', 'booking.completed',       'booking', CAST(@b1 AS NVARCHAR(36)), '{"status":"IN_PROGRESS"}',             '{"status":"COMPLETED"}'),
    -- Booking 2
    (@u2,       'user',   'booking.created',         'booking', CAST(@b2 AS NVARCHAR(36)), NULL,                                   '{"status":"DRAFT"}'),
    (@u2,       'user',   'booking.submitted',       'booking', CAST(@b2 AS NVARCHAR(36)), '{"status":"DRAFT"}',                   '{"status":"PENDING_APPROVAL"}'),
    (@exp2_uid, 'expert', 'booking.approved',        'booking', CAST(@b2 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',        '{"status":"APPROVED_AWAITING_PAYMENT"}'),
    (@u2,       'user',   'payment.paid',            'booking', CAST(@b2 AS NVARCHAR(36)), '{"status":"APPROVED_AWAITING_PAYMENT"}','{"status":"PAID_CONFIRMED"}'),
    -- Booking 3
    (@u3,       'user',   'booking.created',         'booking', CAST(@b3 AS NVARCHAR(36)), NULL,                                   '{"status":"DRAFT"}'),
    (@u3,       'user',   'booking.submitted',       'booking', CAST(@b3 AS NVARCHAR(36)), '{"status":"DRAFT"}',                   '{"status":"PENDING_APPROVAL"}'),
    -- Booking 4
    (@u4,       'user',   'booking.created',         'booking', CAST(@b4 AS NVARCHAR(36)), NULL,                                   '{"status":"DRAFT"}'),
    (@u4,       'user',   'booking.submitted',       'booking', CAST(@b4 AS NVARCHAR(36)), '{"status":"DRAFT"}',                   '{"status":"PENDING_APPROVAL"}'),
    (@exp7_uid, 'expert', 'booking.approved',        'booking', CAST(@b4 AS NVARCHAR(36)), '{"status":"PENDING_APPROVAL"}',        '{"status":"APPROVED_AWAITING_PAYMENT"}');
