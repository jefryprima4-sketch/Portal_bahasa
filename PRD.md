# Product Requirements Document (PRD)
## Portal Bahasa — Language Learning Portal

**Version:** 1.0
**Last Updated:** 2026-04-07
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [Target Users](#3-target-users)
4. [Technical Architecture](#4-technical-architecture)
5. [Authentication & User Management](#5-authentication--user-management)
6. [Core Features](#6-core-features)
7. [Database Schema](#7-database-schema)
8. [Storage Strategy](#8-storage-strategy)
9. [Frontend Structure](#9-frontend-structure)
10. [API & Edge Functions](#10-api--edge-functions)
11. [Anti-Cheating Measures](#11-anti-cheating-measures)
12. [Monitoring & Analytics](#12-monitoring--analytics)
13. [Acceptance Criteria](#13-acceptance-criteria)
14. [Development Roadmap](#14-development-roadmap)
15. [Out of Scope](#15-out-of-scope)
16. [Security Requirements](#16-security-requirements)

---

## 1. Overview

### 1.1 Product Description

Portal Bahasa adalah platform pembelajaran bahasa berbasis web yang dirancang untuk lingkungan laboratorium kampus. Sistem ini menyediakan manajemen materi pembelajaran (PDF, audio, video), sistem Computer-Based Test (CBT) dengan fitur khusus untuk Listening Test, presensi digital, dan dashboard tracking progress.

### 1.2 Value Proposition

- **Listening Module** — fitur pembeda utama dari LMS biasa, dengan audio player terintegrasi untuk tes kemampuan mendengar
- **CBT Stabil** — sistem ujian yang reliable tanpa bug, auto-grading, dan timer otomatis
- **Simple & Cepat** — dirancang khusus untuk penggunaan di laboratorium, bukan LMS berat

### 1.3 Key Differentiators

- Fokus pada pembelajaran bahasa (listening, reading, writing, speaking)
- Kategori materi spesifik: Technical English (kimia/mesin)
- Audio streaming terintegrasi tanpa buffering
- Progress-based unlock system
- Lab management dengan presensi QR

### 1.4 Strategic Considerations

- Mulai dari lingkungan lab (LAN-based), bukan full publik
- Hindari over-engineering di awal (AI scoring untuk speaking ditunda)
- Prioritas: Listening module + CBT stabil
- Auth tidak bergantung pada sistem kampus (LDAP/SIAKAD), namun bisa diupgrade ke SSO nanti

---

## 2. Goals & Objectives

### 2.1 Primary Goals

| # | Goal | Success Metric |
|---|------|---------------|
| 1 | Sistem login cepat dan aman | Login < 2 detik |
| 2 | CBT yang stabil dan reliable | Tidak crash saat 100 user simultan |
| 3 | Listening test yang lancar | Audio streaming tanpa buffering > 90% |
| 4 | Auto-grading yang akurat | Skor langsung tampil setelah submit |
| 5 | Progress tracking | Mahasiswa dan dosen bisa memantau perkembangan |

### 2.2 Secondary Goals

- Presensi digital untuk lab
- Dashboard analitik untuk dosen
- Kategori pembelajaran bahasa (listening, reading, writing, technical English)
- Quiz submit resilient terhadap refresh halaman

### 2.3 Non-Goals (for MVP)

- Integrasi SSO dengan sistem kampus (LDAP/OAuth)
- AI scoring untuk speaking test
- Lab booking system
- Anti-cheat komplek (proctoring, tab lock)

---

## 3. Target Users

### 3.1 User Roles

| Role | Description | Count (Estimated) |
|------|-------------|-------------------|
| **Student** | Mahasiswa yang terdaftar di course bahasa | ~100-500 |
| **Instructor** | Dosen pengampu mata kuliah bahasa | ~5-20 |
| **Admin** | Pengelola sistem (IT staff / koordinator lab) | ~1-3 |

### 3.2 User Profiles

**Student (Mahasiswa):**
- Login menggunakan email format `nim@ptki.ac.id`
- Akses materi, mengerjakan quiz, melihat progress dan nilai
- Self-registration dengan validasi NIM

**Instructor (Dosen):**
- Login menggunakan email format `nip@ptki.ac.id`
- Akun dibuatkan oleh Admin (tidak bisa self-register)
- Membuat course, upload materi, buat quiz, monitoring progress mahasiswa

**Admin:**
- Mengelola user, assign role, upload konten
- Monitoring sistem secara keseluruhan
- Akun dibuatkan oleh Admin lain

---

## 4. Technical Architecture

### 4.1 System Stack

| Component | Technology | Hosting |
|-----------|-----------|---------|
| Frontend | Next.js (React) | Vercel |
| Backend | Supabase (BaaS) | Supabase Cloud / Self-hosted |
| Database | PostgreSQL (via Supabase) | Supabase Cloud |
| Authentication | Supabase Auth (JWT + RBAC) | Supabase Cloud |
| Storage | Supabase Storage | Supabase Cloud |
| Realtime | Supabase Realtime | Supabase Cloud |
| Server Logic | Supabase Edge Functions (Deno) | Supabase Cloud |
| State Management | React Query / TanStack Query | Client-side |

### 4.2 Architecture Diagram

```
┌─────────────────────┐
│   Client (Browser)  │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────┐
│  Next.js App (Vercel)│
│  ┌───────────────┐  │
│  │  Pages / API  │  │
│  │  Middleware    │  │
│  │  React Query   │  │
│  └───────────────┘  │
└──────────┬──────────┘
           │ REST / WebSocket
           ▼
┌─────────────────────┐
│     Supabase         │
│  ┌───────────────┐  │
│  │  Auth (JWT)   │  │
│  ├───────────────┤  │
│  │  Database     │  │
│  │  (PostgreSQL) │  │
│  ├───────────────┤  │
│  │  Storage      │  │
│  │  (CDN)        │  │
│  ├───────────────┤  │
│  │  Edge Func    │  │
│  │  (Quiz Logic) │  │
│  ├───────────────┤  │
│  │  Realtime     │  │
│  │  (Presence)   │  │
│  └───────────────┘  │
└─────────────────────┘
```

### 4.3 Security Architecture

- **Row Level Security (RLS)** di PostgreSQL untuk data isolation per role
- **JWT-based authentication** dari Supabase Auth
- **Signed URLs** untuk akses file di Storage
- **Role-based access control** enforced di database layer, bukan frontend

---

## 5. Authentication & User Management

### 5.1 Authentication Model

| Aspect | Decision |
|--------|----------|
| Login Method | Email + Password |
| Email Format | `nim@ptki.ac.id` (mahasiswa), `nip@ptki.ac.id` (dosen) |
| NIM/NIP Usage | Metadata/identity field, NOT primary login credential |
| SSO | Not required for MVP (can be added later) |
| LDAP/OAuth | NOT required for MVP |

### 5.2 Registration Flow

**Mahasiswa (Self-Register):**
```
1. User mengisi form: Nama, Email, Password, NIM
2. Supabase Auth create user (email + password)
3. Insert data ke tabel `users` (id, email, nim_nip, role='student')
4. Email verification dikirim (Supabase built-in)
5. Setelah verify → redirect ke dashboard
```

**Dosen / Admin (Admin-Created):**
```
1. Admin membuat akun melalui Admin Panel
2. Admin mengisi: Nama, Email, NIM/NIP, Role
3. Admin send invitation email (atau set password manual)
4. Dosen/Admin login dengan credentials yang diberikan
```

### 5.3 Login Flow

```
User input email + password
    → Supabase Auth signin
        → JWT token returned
            → Fetch profile from `users` table
                → Get role
                    → Redirect:
                        student → /dashboard
                        instructor → /dashboard/instructor
                        admin → /admin
```

### 5.4 NIM Validation

**Lightweight (Recommended for MVP):**
- Format validation: numeric only, 8-10 digits
- Stored as metadata in `users` table

**Stronger (Optional):**
- Admin uploads NIM whitelist (CSV)
- Registration checks NIM against whitelist
- Reject if NIM not found in whitelist

### 5.5 RBAC Policy

| Resource | Student | Instructor | Admin |
|----------|---------|------------|-------|
| Own profile | Read/Update | Read/Update | Read/Update all |
| Courses | Read enrolled | CRUD own | CRUD all |
| Materials | Read own course | CRUD own course | CRUD all |
| Quizzes | Read + Submit own | CRUD own course | CRUD all |
| Submissions | View own | View all students | View all |
| Attendance | View own | CRUD own session | View all |
| User management | None | None | CRUD all |

---

## 6. Core Features

### 6.1 Learning Module (Materi)

#### 6.1.1 Material Upload
- **Supported Types:** PDF, Audio (mp3/wav), Video (mp4/webm)
- **Upload by:** Instructor dan Admin
- **Storage:** Supabase Storage Buckets
- **Categories:** Listening, Reading, Writing, Technical English
- **Visibility:** Terikat ke course tertentu

#### 6.1.2 Material Access
- Mahasiswa mengakses materi sesuai course yang di-enroll
- Streaming audio langsung tanpa wajib download
- PDF viewer dan video player terintegrasi
- Tracking: materi yang sudah dibuka/dilihat

#### 6.1.3 Material Metadata
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| course_id | uuid | FK ke courses |
| title | text | Judul materi |
| type | enum | pdf / audio / video |
| file_url | text | URL di Supabase Storage |
| skill_category | enum | listening / reading / writing / technical |
| created_at | timestamp | Waktu upload |

### 6.2 Quiz / CBT System

#### 6.2.1 Question Types

| Type | Description | Grading | Phase |
|------|-------------|---------|-------|
| Multiple Choice (MCQ) | Pilihan ganda (A/B/C/D) | Auto | MVP |
| Essay | Jawaban teks bebas | Manual (oleh dosen) | MVP |
| Matching | Cocokkan pasangan | Auto | Phase 2 |

#### 6.2.2 Quiz Features
- Timer otomatis (server-side, bukan client-side)
- Auto-submit saat waktu habis
- Auto grading untuk MCQ
- Score langsung tampil setelah submit
- Jawaban tersimpan per soal (submission_answers table)
- Resilient terhadap refresh (answers saved per interaction)

#### 6.2.3 Quiz Flow
```
1. Mahasiswa klik "Start Quiz"
2. System fetch soal dari database
3. Timer server-side dimulai
4. Mahasiswa menjawab soal satu per satu
5. Submit manual ATAU auto-submit saat waktu habis
6. Edge Function melakukan grading (MCQ)
7. Score disimpan ke DB
8. Tampilkan hasil ke mahasiswa
```

#### 6.2.4 Quiz Configuration
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| course_id | uuid | FK ke courses |
| title | text | Judul quiz |
| duration | integer | Durasi dalam menit |
| passing_grade | integer | Nilai minimum untuk unlock materi berikutnya |
| randomize_order | boolean | Acak urutan soal |
| shuffle_answers | boolean | Acak urutan jawaban |
| max_attempts | integer | Jumlah percobaan maksimum |
| is_listening | boolean | Flag untuk listening test |

### 6.3 Listening Test Module

#### 6.3.1 Features
- Audio player terintegrasi dalam halaman quiz
- Soal muncul setelah audio diputar
- Audio play limit (opsional, misal maksimal 2x putar)
- Audio streaming dari Supabase Storage (CDN-backed)
- Tidak ada tombol download audio (signed URL, no direct access)

#### 6.3.2 Listening Quiz Flow
```
1. Mahasiswa membuka Listening Quiz
2. Audio player ditampilkan
3. Mahasiswa listen ke audio
4. Setelah audio selesai, soal ditampilkan
5. Mahasiswa menjawab (MCQ / Essay)
6. Submit → Auto grading → Score
```

### 6.4 Dashboard & Progress Tracking

#### 6.4.1 Student Dashboard
- Course aktif yang di-enroll
- Progress belajar (materi yang sudah dibuka)
- Nilai quiz (history + rata-rata)
- Quiz yang belum dikerjakan
- Status unlock (materi berikutnya yang bisa diakses)

#### 6.4.2 Instructor Dashboard
- Daftar course yang diampu
- Progress mahasiswa per course
- Nilai rata-rata per quiz
- Heatmap kesulitan soal (soal yang sering salah)
- Monitoring aktivitas mahasiswa

#### 6.4.3 Admin Dashboard
- Ringkasan total user (per role)
- Total course aktif
- Status sistem
- Link ke user management

### 6.5 Lab Management

#### 6.5.1 Attendance (Presensi)
- Metode: QR Code scan atau manual (dosen menandai hadir)
- Data tersimpan: student_id, timestamp, method
- Realtime update via Supabase Realtime saat presensi
- Dosen bisa melihat rekap presensi

#### 6.5.2 Lab Schedule (Phase 2)
- Jadwal penggunaan lab
- Booking sesi lab (opsional)

### 6.6 Admin Panel

| Feature | Description |
|---------|-------------|
| User CRUD | Create, Read, Update, Delete user |
| Role Assignment | Assign/update role (student/instructor/admin) |
| Course Management | CRUD courses |
| Material Upload | Upload materi untuk course tanpa instructor |
| NIM Whitelist | Upload daftar NIM valid (CSV) |
| System Monitoring | Lihat status sistem, logs |

---

## 7. Database Schema

### 7.1 ERD

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (uuid) PK │──→ FK ke auth.users.id
│ name         │
│ email        │
│ nim_nip      │──→ UNIQUE constraint
│ role         │──→ enum: student/instructor/admin
│ created_at   │
└──────┬───────┘
       │ 1
       │
       │ *
┌──────▼────────┐
│   courses     │
├───────────────┤
│ id (uuid) PK  │
│ title         │
│ description   │
│ instructor_id │ FK → users.id
│ created_at    │
└──────┬────────┘
       │ 1
       │
       │ *
   ┌───┴───────────────────┐
   │                       │
┌──▼────────────┐  ┌──────▼────────────┐
│   materials   │  │     quizzes       │
├───────────────┤  ├───────────────────┤
│ id (uuid) PK  │  │ id (uuid) PK      │
│ course_id     │  │ course_id         │ FK
│ title         │  │ title             │
│ type          │  │ duration          │
| file_url      │  │ passing_grade     │
| skill_category│  │ randomize_order   │
│ created_at    │  │ is_listening      │
└───────────────┘  │ created_at        │
                   └──────┬────────────┘
                          │ 1
                          │
                          │ *
                   ┌──────▼────────────┐
                   │    questions      │
                   ├───────────────────┤
                   │ id (uuid) PK      │
                   │ quiz_id           │ FK
                   │ type              │ enum: mcq/essay/matching
                   │ question_text     │
                   │ audio_url?        │ nullable (listening)
                   └──────┬────────────┘
                          │ 1
                          │
                          │ *
                   ┌──────▼────────────┐
                   │     answers       │
                   ├───────────────────┤
                   │ id (uuid) PK      │
                   │ question_id       │ FK
                   │ answer_text       │
                   │ is_correct        │
                   └───────────────────┘


┌────────────────────┐
│   submissions      │
├────────────────────┤
│ id (uuid) PK       │
│ quiz_id            │ FK → quizzes.id
│ student_id         │ FK → users.id
│ score              │
│ submitted_at       │
│ status             │ enum: in_progress/submitted
└──────┬─────────────┘
       │ 1
       │
       │ *
┌──────▼───────────────┐
│ submission_answers   │
├──────────────────────┤
│ id (uuid) PK         │
│ submission_id        │ FK → submissions.id
│ question_id          │ FK → questions.id
│ answer_id            │ FK → answers.id (nullable for essay)
│ answer_text          │ text (for essay, nullable for MCQ)
└──────────────────────┘


┌──────────────────┐
│   course_enroll  │
├──────────────────┤
│ id (uuid) PK     │
│ course_id        │ FK → courses.id
│ student_id       │ FK → users.id
│ enrolled_at      │
│ progress         │ integer (0-100)
└──────────────────┘


┌──────────────────┐
│   attendance     │
├──────────────────┤
│ id (uuid) PK     │
│ student_id       │ FK → users.id
│ course_id        │ FK → courses.id
│ timestamp        │
│ method           │ enum: qr/manual
└──────────────────┘


┌──────────────────┐
│   material_view  │
├──────────────────┤
│ id (uuid) PK     │
│ student_id       │ FK → users.id
│ material_id      │ FK → materials.id
│ viewed_at        │
└──────────────────┘
```

### 7.2 Table Definitions

#### users

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK, FK auth.users.id | User ID |
| name | text | NOT NULL | Nama lengkap |
| email | text | NOT NULL, UNIQUE | Email address |
| nim_nip | text | NOT NULL, UNIQUE | NIM atau NIP |
| role | text | NOT NULL, CHECK IN ('student','instructor','admin') | Role |
| created_at | timestamptz | DEFAULT now() | Waktu dibuat |

#### courses

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Course ID |
| title | text | NOT NULL | Judul course |
| description | text | | Deskripsi course |
| instructor_id | uuid | FK → users.id | Dosen pengampu |
| created_at | timestamptz | DEFAULT now() | Waktu dibuat |

#### materials

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Material ID |
| course_id | uuid | FK → courses.id | Course pemilik |
| title | text | NOT NULL | Judul materi |
| type | text | NOT NULL, CHECK IN ('pdf','audio','video') | Tipe file |
| skill_category | text | CHECK IN ('listening','reading','writing','technical') | Kategori skill |
| file_url | text | NOT NULL | URL file di Storage |
| created_at | timestamptz | DEFAULT now() | Waktu upload |

#### quizzes

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Quiz ID |
| course_id | uuid | FK → courses.id | Course pemilik |
| title | text | NOT NULL | Judul quiz |
| duration | integer | NOT NULL | Durasi (menit) |
| passing_grade | integer | DEFAULT 70 | Nilai kelulusan |
| randomize_order | boolean | DEFAULT false | Acak soal |
| shuffle_answers | boolean | DEFAULT false | Acak jawaban |
| max_attempts | integer | DEFAULT 1 | Percobaan maksimal |
| is_listening | boolean | DEFAULT false | Flag listening test |
| created_at | timestamptz | DEFAULT now() | Waktu dibuat |

#### questions

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Question ID |
| quiz_id | uuid | FK → quizzes.id | Quiz pemilik |
| type | text | NOT NULL, CHECK IN ('mcq','essay','matching') | Tipe soal |
| question_text | text | NOT NULL | Teks soal |
| audio_url | text | NULLABLE | URL audio (listening) |
| sort_order | integer | DEFAULT 0 | Urutan soal |

#### answers

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Answer ID |
| question_id | uuid | FK → questions.id | Soal pemilik |
| answer_text | text | NOT NULL | Teks jawaban |
| is_correct | boolean | NOT NULL | Apakah jawaban benar |
| sort_order | integer | DEFAULT 0 | Urutan jawaban |

#### submissions

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Submission ID |
| quiz_id | uuid | FK → quizzes.id | Quiz yang dikerjakan |
| student_id | uuid | FK → users.id | Mahasiswa |
| score | numeric | NULLABLE | Nilai akhir |
| submitted_at | timestamptz | NULLABLE | Waktu submit |
| status | text | DEFAULT 'in_progress', CHECK IN ('in_progress','submitted') | Status |

#### submission_answers

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Detail jawaban ID |
| submission_id | uuid | FK → submissions.id | Submission pemilik |
| question_id | uuid | FK → questions.id | Soal yang dijawab |
| answer_id | uuid | FK → answers.id, NULLABLE | Jawaban terpilih (MCQ) |
| answer_text | text | NULLABLE | Jawaban teks (essay) |

#### attendance

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Attendance ID |
| student_id | uuid | FK → users.id | Mahasiswa |
| course_id | uuid | FK → courses.id | Course |
| timestamp | timestamptz | DEFAULT now() | Waktu presensi |
| method | text | DEFAULT 'manual', CHECK IN ('qr','manual') | Metode |

#### course_enroll

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | Enrollment ID |
| course_id | uuid | FK → courses.id | Course |
| student_id | uuid | FK → users.id | Mahasiswa |
| enrolled_at | timestamptz | DEFAULT now() | Waktu enroll |
| progress | integer | DEFAULT 0 | Progress (0-100) |

#### material_view

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | uuid | PK | View ID |
| student_id | uuid | FK → users.id | Mahasiswa |
| material_id | uuid | FK → materials.id | Materi |
| viewed_at | timestamptz | DEFAULT now() | Waktu dilihat |

### 7.3 Row Level Security Policies

```sql
-- Students can only view own profile
CREATE POLICY "student_read_own_profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Students can only update own profile
CREATE POLICY "student_update_own_profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Instructors can view students in their courses
CREATE POLICY "instructor_view_students" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_enroll ce
      JOIN courses c ON c.id = ce.course_id
      WHERE c.instructor_id = auth.uid() AND ce.student_id = users.id
    )
  );

-- Students can only view their own submissions
CREATE POLICY "student_view_own_submissions" ON submissions
  FOR SELECT USING (auth.uid() = student_id);

-- Students can only insert own submissions
CREATE POLICY "student_create_own_submission" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Instructors can view submissions for their courses
CREATE POLICY "instructor_view_submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON c.id = q.course_id
      WHERE q.id = submissions.quiz_id AND c.instructor_id = auth.uid()
    )
  );

-- Students can only view materials in courses they're enrolled in
CREATE POLICY "student_view_course_materials" ON materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_enroll ce
      WHERE ce.course_id = materials.course_id AND ce.student_id = auth.uid()
    )
  );

-- Students can only view their own attendance records
CREATE POLICY "student_view_own_attendance" ON attendance
  FOR SELECT USING (auth.uid() = student_id);

-- Instructors can manage attendance for their courses
CREATE POLICY "instructor_manage_attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = attendance.course_id AND c.instructor_id = auth.uid()
    )
  );

-- Students can only view their own material views
CREATE POLICY "student_view_own_material_views" ON material_view
  FOR SELECT USING (auth.uid() = student_id);

-- Students can insert own material views
CREATE POLICY "student_create_material_view" ON material_view
  FOR INSERT WITH CHECK (auth.uid() = student_id);
```

---

## 8. Storage Strategy

### 8.1 Bucket Structure

| Bucket | Purpose | Access |
|--------|---------|--------|
| `materials` | PDF, video pembelajaran | Signed URL (authenticated) |
| `audio` | Audio untuk listening test | Signed URL (during quiz only) |
| `submissions` | Recording speaking (Phase 3) | Signed URL (instructor + admin) |

### 8.2 Storage Configuration

- **Signed URLs** untuk akses yang aman, expired otomatis
- **CDN built-in** dari Supabase untuk performa streaming
- **No public buckets** — semua akses harus authenticated
- **File size limits:** PDF (10MB), Audio (50MB), Video (200MB)

### 8.3 File Naming Convention

```
/{bucket}/{course_id}/{material_type}/{uuid}_{filename}
Example: /materials/course-abc123/pdf/uuid-xyz-materi1.pdf
         /audio/course-abc123/listening/uuid-xyz-audio1.mp3
```

---

## 9. Frontend Structure

### 9.1 Routes / Pages

| Route | Role | Description |
|-------|------|-------------|
| `/login` | All | Halaman login |
| `/register` | Student | Halaman registrasi mahasiswa |
| `/dashboard` | Student | Dashboard mahasiswa |
| `/dashboard/instructor` | Instructor | Dashboard dosen |
| `/admin` | Admin | Admin panel |
| `/admin/users` | Admin | User management |
| `/admin/courses` | Admin | Course management |
| `/course/[id]` | All | Detail course (materi + quiz) |
| `/course/[id]/material/[materialId]` | Student | View materi (PDF/audio/video) |
| `/quiz/[id]` | Student | Kerjakan quiz |
| `/quiz/[id]/results` | Student | Hasil quiz (score + review) |
| `/profile` | All | Edit profil |

### 9.2 Key Components

| Component | Description |
|-----------|-------------|
| `AuthProvider` | Supabase auth state + JWT management |
| `RoleGuard` | Route protection berdasarkan role |
| `AudioPlayer` | Custom audio player untuk listening test |
| `QuizTimer` | Server-side synced timer countdown |
| `QuizRenderer` | Dynamic quiz question renderer (MCQ/Essay) |
| `MaterialViewer` | PDF viewer + video player |
| `ProgressBar` | Visual progress indicator |
| `AttendanceQR` | QR code scanner/presenter for attendance |

### 9.3 State Management

- **React Query / TanStack Query** untuk server state (wajib)
- **Supabase JS Client** untuk database queries
- **Local state** untuk UI-only state (form, modal, dll)
- **No global state manager** (Redux/Zustand) unless needed

---

## 10. API & Edge Functions

### 10.1 Edge Function Endpoints

| Function | Method | Trigger | Description |
|----------|--------|---------|-------------|
| `/submit-quiz` | POST | Client | Submit quiz answers, auto-grade MCQ |
| `/auto-grade` | POST | Trigger | Grade essay (opsional, Phase 3) |
| `/anti-cheat-validate` | POST | Client | Validate anti-cheating flags |
| `/generate-score` | POST | Internal | Calculate final score from submissions |

### 10.2 Submit Quiz Flow

```
Client → POST /submit-quiz
  Payload: {
    submission_id: uuid,
    answers: [{ question_id, answer_id?, answer_text? }]
  }
    → Edge Function:
      1. Validate submission exists and is in_progress
      2. Validate timer hasn't expired
      3. Save answers to submission_answers
      4. Auto-grade MCQ answers against correct answers
      5. Calculate score
      6. Update submission status to 'submitted'
      7. Return score
    → Response: { success: true, score: 85, total_questions: 20, correct: 17 }
```

### 10.3 Database Triggers

```sql
-- Auto-create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, nim_nip)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'nim_nip', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 11. Anti-Cheating Measures

### 11.1 Implemented Measures

| Measure | Description | Implementation |
|---------|-------------|----------------|
| Randomize Questions | Urutan soal diacak per student | Quiz shuffle on fetch |
| Shuffle Answers | Urutan jawaban diacak per student | Answer order randomization |
| Server-Side Timer | Timer di server, tidak bisa dimanipulasi | Edge function validates expiry |
| Single Session | Batasi 1 sesi aktif per user | Concurrent session check |
| Tab Switch Detection | Track tab visibility via Page Visibility API | Client-side logging, flag di submission |

### 11.2 Tracking

| Event | Tracked | Purpose |
|-------|---------|---------|
| Tab hidden/shown | Page Visibility API | Flag suspicious activity |
| Multiple login | Session tracking | Detect shared accounts |
| Rapid completion | Time taken vs. expected | Detect auto-answer bots |

### 11.3 NOT Implemented (Deliberately)

| Feature | Reason |
|---------|--------|
| Tab lock / fullscreen enforcement | Not reliable, browser limitations |
| Screen recording / webcam proctoring | Overkill for MVP |
| Keystroke monitoring | Privacy concern |

---

## 12. Monitoring & Analytics

### 12.1 Instructor Dashboard Metrics

| Metric | Description |
|--------|-------------|
| Student Progress | Persentase materi yang diselesaikan per mahasiswa |
| Average Score | Rata-rata nilai per quiz |
| Question Heatmap | Soal mana yang paling sering salah (difficulty indicator) |
| Submission Rate | Persentase mahasiswa yang sudah submit quiz |
| Activity Timeline | Grafik aktivitas mahasiswa per minggu |

### 12.2 System Monitoring

| Tool | Purpose |
|------|---------|
| Supabase Logs | Database query logs, error tracking |
| Supabase Dashboard | Realtime connections, storage usage |
| PostHog / Plausible | (Opsional) User behavior analytics |

### 12.3 Events to Track

```
- user_registered
- user_login
- material_viewed
- quiz_started
- quiz_submitted
- audio_played
- attendance_recorded
- tab_switch_detected
```

---

## 13. Acceptance Criteria

### 13.1 Performance Requirements

| Criterion | Threshold | How to Test |
|-----------|-----------|-------------|
| Login speed | < 2 detik dari klik "Login" hingga redirect | Manual testing + timing |
| Audio streaming | > 90% tanpa buffering | Load test 100 concurrent audio plays |
| Concurrent users | 100 user simultan tanpa crash | Load testing dengan k6/Locust |
| Quiz submit resilience | Jawaban tidak hilang walau user refresh | Manual edge case testing |
| Page load (dashboard) | < 3 detik | Lighthouse / WebPageTest |

### 13.2 Functional Requirements

| Criterion | Expected Result |
|-----------|----------------|
| Login dengan email benar + password benar | Sukses, redirect sesuai role |
| Login dengan password salah | Error message, tidak redirect |
| Mahasiswa self-register | Akun dibuat, email verification dikirim |
| Dosen tidak bisa self-register | Register button hidden / blocked |
| Upload PDF (dosen) | File tersimpan, tampil di course |
| View PDF (mahasiswa) | PDF rendering di browser |
| Stream audio (listening test) | Audio player bekerja tanpa download |
| Start quiz → timer berjalan | Timer countdown dan auto-submit |
| Submit quiz (MCQ) | Auto-grading, score tampil langsung |
| Quiz refresh | Jawaban tetap tersimpan (draft saved) |
| Student access course lain | Denied (RLS policy) |
| Student access admin page | Denied (RoleGuard) |

### 13.3 Security Requirements

| Criterion | Expected Result |
|-----------|----------------|
| RLS enforced | Query tanpa auth uid returns 0 rows |
| Role from DB | Role tidak bisa dimanipulasi dari client |
| Signed URL expiry | File URL expired setelah waktu tertentu |
| Unique constraint | NIM tidak bisa diduplikasi |
| Email verification | User unverified tidak bisa login penuh |
| Rate limiting | Spam login/register dibatasi |

---

## 14. Development Roadmap

### 14.1 Phase 1: MVP (4-6 minggu)

**Scope: Auth, Course, Materi, Quiz MCQ, Auto Grading**

| Week | Deliverables |
|------|-------------|
| 1 | Supabase setup (Auth, DB schema, RLS), Next.js project scaffold |
| 2 | Authentication (register/login/logout/email verify), RoleGuard middleware |
| 3 | Course CRUD (instructor), Material upload + view (PDF), course enrollment |
| 4 | Quiz creation (MCQ), quiz taking flow, timer, auto-submit |
| 5 | Auto-grading edge function, score display, student dashboard |
| 6 | Testing, bug fixes, performance optimization, deployment |

**MVP Acceptance:**
- Mahasiswa bisa register → login → access course → view materi → quiz → lihat skor
- Dosen bisa create course → upload materi → buat quiz → monitoring
- Admin bisa create user → assign role

### 14.2 Phase 2

**Scope: Presensi QR, Listening Player, Dashboard Dosen**

| Feature | Description |
|---------|-------------|
| Presensi QR | QR code scan untuk presensi lab |
| Listening Player | Audio player terintegrasi dalam quiz |
| Instructor Dashboard | Progress mahasiswa, statistik, heatmap soal |
| Audio Storage | Bucket khusus audio dengan signed URLs |
| Material Categories | Listening/Reading/Writing/Technical English |

### 14.3 Phase 3

**Scope: Speaking, AI Scoring, Advanced Analytics**

| Feature | Description |
|---------|-------------|
| Speaking Recording | Mahasiswa rekam audio jawaban |
| AI Scoring (opsional) | AI-based pronunciation/fluency scoring |
| Advanced Analytics | Detailed reports, export to CSV/PDF |
| Matching Questions | Tipe soal matching/cocokkan |
| Lab Booking | Sesi booking untuk lab |

---

## 15. Out of Scope

| Item | Reason | Alternative Phase |
|------|--------|-------------------|
| SSO kampus (LDAP/OAuth) | Tidak ada integrasi kampus untuk MVP | Later |
| AI speaking scoring | Over-engineering untuk MVP | Phase 3 |
| Complex anti-cheat (proctoring) | Tidak reliabel, overkill | Later |
| Lab booking system | Tidak critical untuk MVP | Phase 3 |
| Multi-tenant (multiple kampus) | Terlalu kompleks untuk awal | Later |
| Mobile app | Web-first approach | Much later |

---

## 16. Security Requirements

### 16.1 Authentication Security

| Requirement | Implementation |
|-------------|----------------|
| Password policy | Min 8 chars, mix case + number |
| Email verification | Supabase built-in, required before access |
| Rate limiting | Login/register attempt limits |
| Session management | JWT with appropriate expiry |

### 16.2 Authorization Security

| Requirement | Implementation |
|-------------|----------------|
| Row Level Security | All tables have RLS policies |
| Role from DB | Role stored in `users` table, not client state |
| Signed URLs | All storage access via signed URLs |
| API protection | Edge functions validate JWT |

### 16.3 Data Security

| Requirement | Implementation |
|-------------|----------------|
| Unique NIM/NIP | UNIQUE constraint di database |
| No exposed credentials | Client-side code does not contain secrets |
| Secure storage buckets | No public bucket access |
| Input validation | Server-side validation di Edge Functions |

### 16.4 Things to Avoid

| Anti-pattern | Risk |
|--------------|------|
| Login hanya dengan NIM (tanpa password) | Tidak aman, siapa saja bisa login |
| Role ditentukan di frontend | Bisa dimanipulasi, harus dari DB |
| Tanpa email verification | Rawan spam akun palsu |
| Tab lock / fullscreen enforcement | Tidak reliable di semua browser |
| Hardcode credentials di client | Sangat berbahaya, data bisa dicuri |
