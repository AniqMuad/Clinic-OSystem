# SmileCare Dental Clinic OS

## Overview

A full-stack dental clinic operating system with a public patient-facing website and internal staff dashboard. Built as a pnpm monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + shadcn/ui + Tailwind CSS + Recharts
- **Routing**: wouter

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── dental-clinic/      # React + Vite frontend (public site + staff dashboard)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application Features

### Public Website (/)
- **Home**: Hero banner, "Book Now" CTA, WhatsApp float button, testimonials
- **About**: Clinic story, dentist profiles
- **Services**: Treatment catalog with individual detail pages + FAQs
- **Gallery**: Before & After gallery, filterable by treatment
- **Promotions**: Active promo banners (expired auto-hidden)
- **Contact**: Map placeholder, click-to-call, WhatsApp button, contact form
- **Book**: Multi-step booking wizard (Dentist → Treatment → Date/Time → Details → Confirm)

### Staff Dashboard (/dashboard)
- **Overview**: Today's schedule by chair, revenue, stats, low stock alerts
- **Patients**: Search/filter table, quick check-in, full patient detail with tabs
- **Appointments**: Calendar view, status color-coding, book/reschedule/cancel
- **Tasks**: Assistant checklist with priority/status, mark complete
- **Inventory**: Stock levels, low-stock highlights, adjustments
- **Billing**: Create bills, multiple payment methods, mark paid
- **Sterilization**: Instrument sterilization log tracking
- **Chat**: Internal team messaging with emergency alert mode
- **Analytics**: Revenue charts, treatment stats, appointment breakdowns
- **SOP Library**: Searchable clinical procedures
- **Settings**: Staff management (Admin only)

### Role-Based Access
- **Admin**: Full access including Settings + Staff management
- **Dentist**: Dashboard, Patients, Appointments, Tasks, Billing, SOP, Chat
- **Assistant**: Dashboard, Tasks, Sterilization, Inventory, SOP, Chat
- **Front Desk**: Dashboard, Patients, Appointments, Billing, Chat

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smilecare.my | Admin@1234 |
| Dentist | dentist2@smilecare.my | Dentist@1234 |
| Assistant | assistant@smilecare.my | Asst@1234 |
| Front Desk | frontdesk@smilecare.my | Front@1234 |

## API Routes

All routes prefixed with `/api`:

- `POST /auth/login` — Staff login
- `GET /auth/me` — Current user
- `GET/POST /staff` — Staff management
- `GET/POST /patients` — Patient management
- `POST /patients/:id/checkin` — Quick check-in
- `GET/POST /appointments` — Appointment management
- `GET /appointments/today` — Today's schedule
- `GET/POST /treatments` — Treatment catalog
- `GET/POST /inventory` — Inventory management
- `GET /inventory/low-stock` — Low stock alerts
- `GET/POST /billing` — Billing management
- `POST /billing/:id/pay` — Process payment
- `GET/POST /tasks` — Task management
- `GET/POST /sterilization` — Sterilization logs
- `GET/POST /chat/messages` — Internal chat
- `GET /analytics/dashboard` — Dashboard stats
- `GET /analytics/revenue` — Revenue reports
- `GET /analytics/treatments` — Treatment statistics
- `GET/POST /promotions` — Promotions management
- `POST /bookings` — Public appointment booking
- `GET /bookings/available-slots` — Available time slots
- `GET /sops` — SOP library

## Database Tables

- `staff` — Staff members with role-based auth
- `patients` — Patient records
- `appointments` — Appointments linked to patient + dentist
- `treatment_logs` — Clinical treatment history per patient
- `treatments` — Treatment catalog with FAQs
- `inventory` — Dental supply inventory
- `bills` — Billing records with line items
- `tasks` — Workflow tasks for assistants
- `sterilization_logs` — Instrument sterilization tracking
- `chat_messages` — Internal team messages
- `promotions` — Marketing promotions
- `sops` — Clinical standard operating procedures

## TypeScript & Composite Projects

- `lib/*` packages are composite and emit declarations via `tsc --build`
- Root `tsconfig.json` is a solution file for libs only
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`
