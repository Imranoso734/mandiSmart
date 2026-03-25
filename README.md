# Bin Management System Backend

Backend API for the Bin Management System, built with Node.js, TypeScript, Fastify, Prisma, and PostgreSQL.

## What It Covers

- User authentication and password flows
- Site and site-manager management
- Logistics manager site assignments
- Bin inventory management
- Subcontractor and worker management
- Allocation creation, listing, and bin returns
- Asset uploads to S3
- Analytics endpoints for dashboard data
- Reporting endpoints, including PDF exports via Puppeteer
- Branded email notifications for operational events
- Audit trail APIs

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- AWS S3
- AWS SES / Resend-compatible email config
- Puppeteer

## Roles

### Admin

- Manage sites
- Manage internal users
- Access system-wide data

### Site Manager

- Manage bins, subcontractors, and site-level operations
- View analytics and reports
- Assign logistics managers to sites

### Logistics Manager

- Create allocations
- Return bins fully or partially
- Work within assigned sites only

### Subcontractor

- No login access
- Receives communication through workers/email only

## Main Modules

- `auth`
- `forgotPassword`
- `password`
- `user`
- `site`
- `siteManager`
- `booking`
- `assets`
- `analytics`
- `reportings`
- `auditLog`

## Email Notifications

The system currently sends branded email notifications for:

- allocation approved
- allocation return update
- forgot password / password reset
- logistics manager account creation
- site assignment status updates

Email templates use the same visual direction as PDF reports and include the project logo from `public/pBinLogo.png`.

## Environment Variables

Copy `.env.example` to `.env` and fill in real values.

```env
DATABASE_URI="postgresql://postgres:postgres@localhost:5432/bin_management?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"

PORT=5000
HOST=0.0.0.0
FRONT_END_URL="http://localhost:3000/"
PUBLIC_BASE_URL="http://localhost:5000"
APP_TIMEZONE="Europe/London"

EMAIL_PROVIDER="ses"
FROM_EMAIL="notifications@example.com"
RESEND_EMAIL_API_KEY=""

AWS_REGION="eu-west-2"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

AWS_IMAGE_BUCKET_NAME="your-image-bucket"
AWS_IMAGE_BUCKET_REGION="eu-west-2"

AWS_S3_BUCKET="your-generic-s3-bucket"
PDF_BUCKET_URL=""

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe123!"

FAIREBASETOKEN=""
```

### Notes

- `AWS_IMAGE_BUCKET_NAME` and `AWS_IMAGE_BUCKET_REGION` are used for uploaded booking/assets files.
- `AWS_S3_BUCKET` exists in config for generic storage usage.
- `APP_TIMEZONE` affects reporting and date/time formatting.
- PDF report generation uses Puppeteer and expects Chrome/Chromium availability in the runtime environment.
- Email delivery uses the configured provider and `FROM_EMAIL`.
- `PUBLIC_BASE_URL` is used to build absolute public asset URLs for emails, such as the logo image.

## Setup

```bash
npm install
```

## Development

```bash
npm run start:dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm run start:prod
```

## Useful Commands

```bash
npm run gen:secret
npm run gen:types
npm run db:migrate
npm run db:seed
npm run test
npm run lint
```

## Reporting and PDF Exports

Business reports are available under `/api/v1/reports`.

Current PDF export endpoints include:

- `/api/v1/reports/top-most-used-bins/export/pdf`
- `/api/v1/reports/idle-bins/export/pdf`
- `/api/v1/reports/logistics-manager-activity/export/pdf`
- `/api/v1/reports/stuck-active-bookings/export/pdf`
- `/api/v1/reports/repeat-subcontractor-demand/export/pdf`

These endpoints return `application/pdf` and include a download filename through the `Content-Disposition` header.

Current default filenames include:

- `top-most-used-bins-report.pdf`
- `idle-bins-report.pdf`
- `logistics-manager-activity-report.pdf`
- `stuck-active-bookings-report.pdf`
- `repeat-subcontractor-demand-report.pdf`

## Frontend Integration Note

For Next.js or other frontend clients:

- call the PDF endpoint with the bearer token
- read the response as a `blob`
- trigger download in the browser

## Audit Trail Rules

- Admin can view all audit logs.
- Site managers can view only logs for their own managed sites.
- Site-level admin actions are restricted from site-manager audit views.
- Audit logs are written with site scope where applicable so each site sees only its own operational activity.

## Project Structure

```text
src/
  app/
    config/
    modules/
    routers.ts
  core/
    database/
    email/
    helpers/
    server/
prisma/
  schema.prisma
docker-compose.yml
Dockerfile
```
