# CareQuery - Healthcare Management System

## Overview

CareQuery is a healthcare management web application built with Next.js, TypeScript, and Tailwind CSS. It allows users to manage patients, book appointments, execute raw SQL queries (admin-only), and send email summaries. The app uses PGlite (in-memory PostgreSQL) for data storage, `BroadcastChannel` for cross-tab synchronization, EmailJS for email notifications, and Shadcn UI for a polished interface.

### Features

- **Dashboard**:
  - Add patients with details (name, medical ID, DOB, medical condition, email, contact, address).
  - Book appointments with patient selection, doctor selection, date, time slots, and reason.
  - View all patients in a table with update/delete actions.
- **Patient View**:
  - View patient details and appointment history at `/patients/[patientId]`.
  - Send email summaries using EmailJS.
  - Download patient details as a PDF using `jspdf`.
- **SQL Page (Admin-Only)**:
  - Execute raw SQL queries on `patients`, `appointments`, and `users` tables.
  - Interactive query builder: select table, filter by column, sort by column.
  - Features include clear buttons for each section, query input focus, and CSV download of results.
  - Result table is scrollable (horizontal/vertical) with sticky headers.
- **Sidebar**:
  - Fixed sidebar with navigation to Dashboard and SQL page (admin-only).
  - Logout button to clear authentication.
- **Appointment Features**:
  - Time slots for scheduling (e.g., 9:00 AM - 5:00 PM).
  - Reschedule appointments with updated details.
  - Display doctor names in appointment tables.
- **Authentication**:
  - Role-based access: Admin (`role: "admin"`) and User (`role: "user"`).
  - Admin-only access to `/sql` page with redirect for non-admins.
- **Cross-Tab Sync**:
  - Uses `BroadcastChannel` in `lib/db.ts` to synchronize patient and appointment data across browser tabs.
- **Dependencies**:
  - PGlite (`@electric-sql/pglite`) for in-memory database.
  - EmailJS (`@emailjs/browser`) for sending email summaries.
  - Shadcn UI components for UI (`@radix-ui/*`, `lucide-react`).
  - Other: `date-fns`, `sonner` (toasts), `jspdf`, `bcryptjs`.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Docker (optional, for containerized deployment)
- EmailJS account for email functionality

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd carequery
   ```

2. **Install Dependencies**:
   ```bash
   npm install @electric-sql/pglite uuid bcryptjs date-fns @emailjs/browser @radix-ui/react-select @radix-ui/react-button @radix-ui/react-input @radix-ui/react-label @radix-ui/react-tabs @radix-ui/react-calendar @radix-ui/react-popover @radix-ui/react-table sonner jspdf lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu
   npx shadcn-ui@latest add select button input label tabs calendar popover table dialog dropdown-menu
   npm uninstall resend @react-email/components
   ```

3. **Set Up Environment Variables**:
   - Create a `.env.local` file in the root directory:
     ```env
     NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxx
     NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxx
     NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
     ```
   - Replace `service_xxxxxx`, `template_xxxxxx`, and `xxxxxxxxxxxx` with your EmailJS credentials.

4. **Clear IndexedDB (Optional)**:
   - If you encounter database issues, clear the IndexedDB storage:
     ```javascript
     indexedDB.deleteDatabase('idb://carequery');
     ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   - Open `http://localhost:3000` in your browser.

## Usage

1. **Login**:
   - Default admin credentials: Username: `admin`, Password: `admin123`.
   - Non-admin users cannot access the `/sql` page.

2. **Dashboard**:
   - Navigate to `/dashboard`.
   - Use the "Add Patient" tab to create a new patient.
   - Use the "Book Appointment" tab to schedule an appointment (select patient, doctor, date, time, reason).
   - View all patients in the "Patients" tab with options to update or delete.

3. **Patient View**:
   - Go to `/patients/[patientId]` to view a patient’s details and appointments.
   - Click "Send Email Summary" to send an email via EmailJS.
   - Click "Download PDF" to download patient details as a PDF.

4. **SQL Page (Admin-Only)**:
   - Navigate to `/sql`.
   - Write a raw SQL query or use the interactive builder:
     - Select a table (`patients`, `appointments`, `users`).
     - Filter by column (e.g., `name LIKE 'John'`).
     - Sort by column (e.g., `dob ASC`).
     - Click "Generate Query" to auto-fill the query input.
     - Click "Execute Query" to see results.
   - Use "Clear" buttons to reset table, filter, or sort options.
   - Download results as a CSV file using "Download as CSV".

5. **Sidebar**:
   - Fixed sidebar appears on all pages except `/` and `/auth`.
   - Click "Logout" to clear authentication and redirect to `/auth`.

## File Structure

```
carequery/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard with patient form, appointment form, and patient table
│   ├── patients/
│   │   └── [patientId]/
│   │       └── page.tsx      # Patient details view with email and PDF download
│   ├── sql/
│   │   └── page.tsx          # Admin-only SQL query page with interactive builder
│   ├── auth/
│   │   └── page.tsx          # Authentication page (assumed)
│   └── layout.tsx            # Root layout with fixed sidebar and scrollable content
├── components/
│   ├── AppointmentForm.tsx   # Form for booking appointments
│   ├── PatientTable.tsx      # Table displaying all patients
│   ├── CellAction.tsx        # Actions for patient table (update/delete)
│   ├── FormDialog.tsx        # Dialog component for forms
│   ├── Sidebar.tsx           # Fixed sidebar with navigation and logout
│   ├── PatientDetails.tsx    # Deprecated: Patient details component
│   └── ReportUpload.tsx      # Deprecated: Report upload component
├── lib/
│   ├── db.ts                 # PGlite database setup with BroadcastChannel
│   ├── patient.ts            # Patient CRUD operations
│   ├── appointment.ts        # Appointment CRUD operations with reschedule
│   ├── AuthContext.tsx      # Authentication context with role-based access
│   └── report.ts             # Deprecated: Report generation utilities
├── public/                   # Static assets
├── .env.local                # Environment variables (EmailJS)
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # Project documentation
```

## Testing Instructions

1. **Layout**:
   - Go to `/dashboard`, `/sql`, `/patients/[patientId]`.
   - Verify sidebar is fixed, content scrolls, no hydration errors.
   - Resize window; ensure no overflow.

2. **Dashboard**:
   - Add a patient (fill all fields).
   - Book an appointment (select patient, doctor, date, time, reason).
   - View patients in the table; test update/delete actions.

3. **Patient View**:
   - Go to `/patients/[patientId]`.
   - Send an email summary (check EmailJS dashboard).
   - Download PDF and verify content.

4. **SQL Page**:
   - Log in as admin.
   - Go to `/sql`.
   - Run a query (e.g., `SELECT * FROM patients`).
   - Use interactive builder: select table, filter, sort, generate query.
   - Clear sections, download CSV, verify table scrolling.

5. **Admin Restriction**:
   - Log in as non-admin (or set `role: "user"` in `AuthContext`).
   - Go to `/sql`; expect redirect to `/login` with toast message.

6. **Other Features**:
   - **Logout**: Click "Logout" in sidebar.
   - **Time Slots**: Verify time dropdown in `AppointmentForm`.
   - **Reschedule**: Update an appointment.
   - **Doctor Names**: Verify doctor names in appointment table.
   - **Cross-Tab Sync**: Open two tabs, add a patient in one, verify it appears in the other.

## Deployment with Docker

1. **Build the Docker Image**:
   ```bash
   docker build -t carequery .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```
   - Access the app at `http://localhost:3000`.

3. **Environment Variables**:
   - Ensure `.env.local` is copied into the container or passed via `docker-compose.yml`.

## Notes

- **Deprecated Files**:
  - `components/PatientDetails.tsx`, `lib/report.ts`, `components/ReportUpload.tsx` are deprecated but retained pending confirmation for removal.
- **Multi-Tab Sync**:
  - Current `BroadcastChannel` implementation in `lib/db.ts` works for basic cross-tab sync.
  - Awaiting further enhancements for multi-tab feature.
- **Improvements**:
  - Add multi-condition filters in SQL page (`AND`, `OR`).
  - Implement natural language to SQL (e.g., "show patients named John").
  - Add Chart.js for visualizing query results.
  - Adjust table max height or sidebar width if needed.

## License

This project is licensed under the MIT License.