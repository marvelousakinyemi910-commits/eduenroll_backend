# EduEnroll — Backend API

A production-ready REST API for **EduEnroll**, a university course registration system. Built with **Node.js, Express, TypeScript, Prisma, and MySQL**, following clean architecture (routes → controllers → services → Prisma) with JWT auth, role-based access control, and the full set of course-registration business rules from the product spec.

## Tech Stack

- **Runtime:** Node.js + Express + TypeScript
- **ORM / DB:** Prisma + MySQL
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing, role-based authorization
- **Validation:** Zod
- **Security:** Helmet, CORS, rate limiting, cookie-based refresh tokens (httpOnly)

## Architecture

```
src/
├── config/         # env loading, Prisma client singleton
├── controllers/     # thin HTTP layer — parses req, calls services, shapes res
├── services/         # business logic + Prisma queries (the "brains")
├── routes/           # Express routers, wired to middleware + controllers
├── middlewares/       # auth, role guard, validation, error handling, rate limiting
├── validations/      # Zod schemas per module
├── utils/             # ApiError, JWT helpers, password hashing, GPA calculator
├── app.ts             # Express app factory (middleware pipeline)
└── server.ts          # process entrypoint, graceful shutdown

prisma/
├── schema.prisma      # full data model
└── seed.ts            # sample admin/instructor/student/courses
```

Each layer only talks to the layer below it: **routes** wire HTTP verbs + middleware to **controllers**, which validate nothing themselves (that's `validate.middleware.ts` + Zod) and simply call **services**, which own all business rules and talk to Prisma directly. This keeps controllers thin and business logic unit-testable in isolation from Express.

## Getting Started

### 1. Install dependencies

```bash
cd eduenroll-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# then edit .env — at minimum set DATABASE_URL and the two JWT secrets
```

### 3. Set up the database

```bash
npm run prisma:migrate     # creates tables from schema.prisma
npm run prisma:seed        # loads sample admin/instructor/student/courses
```

### 4. Run the dev server

```bash
npm run dev                # http://localhost:5000
```

Health check: `GET http://localhost:5000/api/v1/health`

### Seeded accounts (after `prisma:seed`)

| Role       | Email                       | Password        |
|------------|------------------------------|------------------|
| Admin      | admin@eduenroll.edu          | Admin@12345      |
| Instructor | jsmith@eduenroll.edu         | Instructor@123   |
| Student    | jane.doe@eduenroll.edu       | Student@123      |

## Auth Flow

1. `POST /api/v1/auth/register` or `/login` returns a short-lived **access token** (JSON body) and sets a long-lived **refresh token** as an httpOnly cookie.
2. Send the access token as `Authorization: Bearer <token>` on subsequent requests.
3. When it expires, call `POST /api/v1/auth/refresh` (cookie is sent automatically by the browser) to get a new access token.
4. `POST /api/v1/auth/logout` clears the refresh token (server-side + cookie).

## API Reference (v1, base path `/api/v1`)

### Auth
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | Public | Student/Admin self-registration |
| POST | `/auth/login` | Public | |
| POST | `/auth/refresh` | Public (cookie) | Rotates refresh token |
| POST | `/auth/logout` | Authenticated | |
| GET | `/auth/profile` | Authenticated | |

### Students
| Method | Path | Access |
|---|---|---|
| GET | `/students` | Admin, Instructor |
| GET | `/students/:id` | Admin, Instructor |
| GET | `/students/:id/transcript` | Admin, Instructor |
| GET | `/students/me/transcript` | Student |
| POST | `/students` | Admin |
| PUT | `/students/:id` | Admin |
| DELETE | `/students/:id` | Admin |

### Instructors / Departments / Semesters
Standard CRUD at `/instructors`, `/departments`, `/semesters` (writes require **Admin**; `/semesters/active` returns the currently active term; `/semesters/:id/close-registration` closes it early).

### Courses
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/courses` | Authenticated | Filter by `search`, `departmentId`, `semesterId`, `instructorId`, `page`, `limit` |
| GET | `/courses/:id` | Authenticated | |
| POST/PUT/DELETE | `/courses(/:id)` | Admin | Unique per (code, semester); prerequisites by course code |

### Registrations
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/registrations` | Student | `{ courseId }` — enforces all business rules below |
| DELETE | `/registrations/:id` | Student | Drop (blocked after deadline) |
| GET | `/registrations/student` | Student | Own registrations |
| GET | `/registrations/timetable?semesterId=` | Student | Own weekly timetable |
| GET | `/registrations/course/:id` | Admin, Instructor | Roster for a course |
| PATCH | `/registrations/:id/status` | Admin | Approve / reject a pending registration |

**Registration business rules enforced in `registration.service.ts`:**
- Registration window (semester `registrationStart`/`registrationEnd`) must be open
- No duplicate registration for the same course
- Course must have available seats
- Prerequisites (by course, not just credit) must be passed
- Total active credit load (incl. this course) ≤ `MAX_CREDIT_LOAD` (default 24, configurable via env)
- No timetable clash with the student's other active registrations
- Dropping is blocked after the semester's registration deadline

### Grades
| Method | Path | Access |
|---|---|---|
| POST | `/grades` | Admin, Instructor — `{ registrationId, letter }`, only on approved registrations |
| GET | `/grades/me` | Student |
| GET | `/grades/student/:id` | Admin, Instructor |

GPA/CGPA are computed on the fly (credit-weighted, 5-point scale A=5.0 … F=0.0) — see `utils/gpa.ts` and `students/:id/transcript`.

### Dashboard
| Method | Path | Access | Returns |
|---|---|---|---|
| GET | `/dashboard/student` | Student | registered courses, current credits, CGPA, GPA trend, active semester |
| GET | `/dashboard/admin` | Admin | totals, department enrollment, most popular courses |

## Security

- Helmet (secure headers), CORS locked to `CLIENT_URL`, `express-rate-limit` (global + stricter on auth routes)
- Passwords hashed with bcrypt (12 salt rounds)
- JWT access tokens (short-lived) + rotating refresh tokens stored server-side and as httpOnly cookies
- Zod validation on every mutating endpoint; centralized error handler normalizes Zod/Prisma/custom errors so nothing leaks stack traces in production
- Role-based authorization middleware on every protected route

## Extending

This MVP intentionally leaves room for the spec's "nice-to-have" items — PDF transcript export, CSV export, waitlists, messaging, attendance, 2FA, audit logs — as additive modules following the same routes → controller → service pattern. Swagger/OpenAPI docs, a Dockerfile, and CI (GitHub Actions running `npm run build` + `prisma migrate deploy`) are natural next additions once the frontend contract stabilizes.

## Deployment Notes

- **DB:** Railway MySQL or PlanetScale — set `DATABASE_URL`, then `npm run prisma:deploy` in your deploy step
- **API:** Render (or any Node host) — build with `npm run build`, start with `npm start`; set all `.env.example` vars in the dashboard
- Set `CLIENT_URL` to your deployed frontend origin so CORS + cookies work correctly
