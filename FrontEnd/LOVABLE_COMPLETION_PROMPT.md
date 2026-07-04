# NeuroScan AI - Frontend Completion Prompt
## Building on Existing Patient Implementation

---

## PROJECT STATUS

### ✅ Already Working (DO NOT MODIFY)
- Patient authentication flow (login, register, logout)
- Patient dashboard with metrics and recent analyses
- Patient MRI upload, history, details pages
- Patient profile and support page
- Landing page, login/register pages
- Navbar and Sidebar components with patient navigation
- Floating chatbot component
- Design system, styling, and UI components
- API client setup with JWT interceptors
- AuthContext with role management
- TanStack Router file-based routing
- Tailwind CSS theme with all colors and spacing

### ⚠️ Partially Working (MINOR FIXES NEEDED)
- Navbar: Update to show role-based page titles
- Sidebar: Make navigation role-aware
- Notifications dropdown: Implement full functionality
- Support page: Complete API integration

---

## PRIMARY OBJECTIVES

### OBJECTIVE 1: Make Navigation Role-Aware
Update the Navbar and Sidebar components to dynamically change based on `user.role` (PATIENT, DOCTOR, ADMIN).

**Required Changes:**
1. **Sidebar Component** (`src/components/layout/Sidebar.tsx`):
   - Import conditional navigation based on role
   - Show `patientNav` when role === "PATIENT"
   - Show `doctorNav` when role === "DOCTOR"
   - Show `adminNav` when role === "ADMIN"

2. **Navbar Component** (`src/components/layout/Navbar.tsx`):
   - Create role-based title mapping
   - Show different titles for /doctor/* paths
   - Show different titles for /admin/* paths
   - Keep existing patient path titles

**Navigation Items per Role:**

**Patient Navigation:**
- Dashboard → /patient/dashboard
- Upload MRI → /patient/upload-mri
- MRI History → /patient/mri-history
- AI Assistant → /patient/chatbot
- Support → /patient/support
- Profile → /patient/profile

**Doctor Navigation:**
- Dashboard → /doctor/dashboard
- Assigned Patients → /doctor/patients
- Pending MRI → /doctor/pending-mri
- Reviewed Analyses → /doctor/reviewed-analyses
- Support → /doctor/support
- Profile → /doctor/profile

**Admin Navigation:**
- Dashboard → /admin/dashboard
- Manage Doctors → /admin/doctors
- Manage Patients → /admin/patients
- Assign Doctor → /admin/assign-doctor
- Support Tickets → /admin/support
- Notifications → /admin/notifications

---

### OBJECTIVE 2: Create Doctor Routes & Pages

Create the complete doctor workflow with the following routes:

**1. Doctor Dashboard** (`src/routes/_authenticated/doctor/dashboard.tsx`)
- Display metric cards: Assigned Patients, Pending MRI, Reviewed Analyses, This Month's Total
- Show "Recent Pending MRI Analyses" card listing 5 most recent
- Quick action buttons: View Pending MRI, View Patients, View Support
- Use same layout as patient dashboard (Navbar + Sidebar + content)

**2. Assigned Patients Page** (`src/routes/_authenticated/doctor/patients.tsx`)
- Search bar: filter by patient name/email
- Sort options: by name, by date added
- Display patient cards/table with: avatar, name, email, date assigned, MRI count, last analysis date
- Action buttons: "View Patient Analyses", "View Patient Profile"
- Empty state when no patients

**3. Pending MRI Page** (`src/routes/_authenticated/doctor/pending-mri.tsx`)
- Sort/filter options
- Display pending MRI cards: patient name, MRI ID, date uploaded, AI prediction, confidence score
- Status badge: "PENDING REVIEW"
- Action buttons: "Review MRI" (blue → /doctor/mri/:id/review), "View Patient Info"
- Empty state when no pending

**4. Reviewed Analyses Page** (`src/routes/_authenticated/doctor/reviewed-analyses.tsx`)
- Sort by review date, patient name
- Display reviewed MRI cards: patient name, MRI ID, prediction, confidence, review date
- Status badge: "REVIEWED"
- Action buttons: "View Details", "Download Report"

**5. Review MRI Page** (`src/routes/_authenticated/doctor/mri.$id.review.tsx`)
- **Left column:** Original MRI image
- **Right column:** 
  - MRI analysis results (prediction, confidence, probability, status)
  - Patient info card (name, email, phone, assigned date)
  - GradCAM visualization side-by-side with original
- **Full-width below:** Large textarea for doctor notes
- Action buttons: "Submit Review", "Save as Draft", "Back to Pending"
- Confirmation dialog before submitting

**6. Doctor Profile Page** (`src/routes/_authenticated/doctor/profile.tsx`)
- Profile info (name, email, phone, license number)
- Edit form with fields: firstName, lastName, phone, licenseNumber
- Password change section
- Logout button with confirmation

**7. Doctor Support Page** (`src/routes/_authenticated/doctor/support.tsx`)
- Reuse patient support page component (or create shared support page)
- Same layout: list of support tickets, view ticket threads

---

### OBJECTIVE 3: Create Admin Routes & Pages

Create the complete admin workflow with the following routes:

**1. Admin Dashboard** (`src/routes/_authenticated/admin/dashboard.tsx`)
- Metric cards: Total Doctors, Total Patients, Total MRI Analyses, Open Support Tickets
- Recent activity panel showing 10 most recent activities
- Quick action buttons: Add Doctor, View All Patients, View Support Tickets

**2. Doctors Management Page** (`src/routes/_authenticated/admin/doctors.tsx`)
- Search bar: filter by name, email, license number
- Sort options: by name, date added, patient count
- Display doctors as table/cards: avatar, name, email, license number, patients assigned, date created, status
- Action buttons per row: Edit, View Patients, Delete (with confirmation)
- "Add New Doctor" button (blue) at top-right → opens modal
- Create Doctor Modal: Form with fields (firstName, lastName, email, password, phone, licenseNumber)
- Empty state when no doctors

**3. Patients Management Page** (`src/routes/_authenticated/admin/patients.tsx`)
- Search bar: filter by name, email
- Filter options: doctor assigned (dropdown), status (all/with doctor/unassigned)
- Sort by name, date registered
- Display patients as table/cards: avatar, name, email, assigned doctor, MRI count, date registered
- Action buttons per row: View Profile, Assign Doctor (blue if unassigned), View Analyses, Delete
- Empty state when no patients

**4. Assign Doctor Page** (`src/routes/_authenticated/admin/assign-doctor.tsx`)
- Two-column layout:
  - **Left:** "Select Patient" - searchable dropdown/select showing unassigned patients (or all)
  - **Right:** "Select Doctor" - searchable dropdown/select showing doctors
- Assignment details card showing selected patient and doctor info
- "Assign Doctor" button (blue, disabled until both selected)
- Confirmation dialog before assigning
- Recent assignments table below showing history
- Reverse/unassign option

**5. Admin Support Page** (`src/routes/_authenticated/admin/support.tsx`)
- Search bar: filter by ticket ID, subject, user name
- Filter by status: OPEN, CLOSED
- Sort by date created, most recent
- Display support tickets as table: ticket ID, user name, subject, status badge, created date, last message date, unread count
- Action buttons: "View Ticket", "Close Ticket"/"Reopen Ticket"
- Modals for viewing full ticket threads

**6. Admin Notifications Page** (`src/routes/_authenticated/admin/notifications.tsx`)
- Filter by type: all, system, patient, doctor, admin
- Filter by read status: all, unread, read
- Sort by date: newest first
- Display notifications as list/cards: icon, title, message, timestamp, read/unread indicator
- Click to mark as read/unread
- Click message to navigate to relevant page

**7. Admin Profile Page** (optional - `src/routes/_authenticated/admin/profile.tsx`)
- Admin profile info and edit fields
- Password change section

---

### OBJECTIVE 4: Create API Function Modules

Create dedicated API modules for clean separation of concerns:

**1. `src/lib/api/doctor.ts`**
```typescript
export async function getDoctorPatients(doctorId?: string) { ... }
export async function getPendingMri() { ... }
export async function getReviewedAnalyses() { ... }
export async function submitMriReview(mriId: string, notes: string) { ... }
export async function saveDraftReview(mriId: string, notes: string) { ... }
export async function getDoctorProfile() { ... }
export async function updateDoctorProfile(data: {...}) { ... }
```

**2. `src/lib/api/admin.ts`**
```typescript
export async function getAllDoctors() { ... }
export async function createDoctor(data: {...}) { ... }
export async function updateDoctor(doctorId: string, data: {...}) { ... }
export async function deleteDoctor(doctorId: string) { ... }
export async function getAllPatients(filters?: {...}) { ... }
export async function assignDoctorToPatient(patientId: string, doctorId: string) { ... }
export async function unassignDoctor(patientId: string) { ... }
export async function getAdminDashboardMetrics() { ... }
export async function getRecentActivities() { ... }
export async function getAdminNotifications() { ... }
```

**3. `src/lib/api/support.ts`**
```typescript
export async function getSupportTickets() { ... }
export async function getSupportTicketById(ticketId: string) { ... }
export async function getSupportTicketMessages(ticketId: string) { ... }
export async function createSupportTicket(data: {...}) { ... }
export async function addMessageToTicket(ticketId: string, message: string) { ... }
export async function closeTicket(ticketId: string) { ... }
export async function reopenTicket(ticketId: string) { ... }
```

**4. `src/lib/api/notifications.ts`**
```typescript
export async function getNotifications(limit?: number) { ... }
export async function markNotificationAsRead(notificationId: string) { ... }
export async function markAllAsRead() { ... }
export async function getAdminNotifications() { ... }
```

---

### OBJECTIVE 5: Create Shared Components & Types

**New Type Definitions** (`src/lib/types/` - create if doesn't exist):
- MRI type with analysis data, doctor review fields
- Doctor type with license info
- Patient type with demographics
- SupportTicket type
- Notification type
- DashboardMetrics type per role

**New Components:**
- `DoctorReviewForm.tsx`: Textarea + submit logic for doctor notes
- `DoctorPatientCard.tsx`: Patient info card for doctor dashboard
- `AdminDoctorForm.tsx`: Modal form for creating/editing doctors
- `AdminAssignDoctorForm.tsx`: Form for assigning doctors to patients
- `SupportTicketList.tsx`: Shared list component for support tickets
- `SupportTicketThread.tsx`: Shared thread viewer component
- `ActivityFeed.tsx`: Recent activity list for admin dashboard
- `MetricCard.tsx`: Reusable metric card (already have StatCard, consider generic version)

---

### OBJECTIVE 6: Update Layout & Navigation

**1. Create Multi-Role Layout Structure:**
- Keep current `_authenticated.tsx` as parent
- It should conditionally render sidebar/navbar based on role
- Sidebar and Navbar should both check `user.role` and render appropriate content

**2. Update Route Structure in Sidebar:**
- Show patient routes for PATIENT
- Show doctor routes for DOCTOR
- Show admin routes for ADMIN

**3. Update Navbar Titles:**
- Patient titles: existing mapping
- Doctor titles: /doctor/dashboard → "Dashboard", /doctor/pending-mri → "Pending Reviews", etc.
- Admin titles: /admin/dashboard → "Dashboard", /admin/doctors → "Doctors", etc.

---

## IMPLEMENTATION GUIDELINES

### Code Quality
- Follow existing patterns (use existing components, styling, hooks)
- Preserve the design system (colors, spacing, shadows, animations)
- Maintain TypeScript strict mode
- Use lucide-react icons consistently
- Use existing Card, Badge, StatCard, Disclaimer, EmptyState components

### API Integration
- Use axios `api` client from `src/lib/api.ts`
- Add JWT token automatically (already configured)
- Handle 401 errors (already configured)
- Add proper error handling with toast notifications
- Show loading states during API calls

### UI/UX Patterns
- Copy successful patterns from patient pages
- Use same stat card styling for all dashboards
- Use same card layouts for lists
- Use same action button styles
- Use same empty states
- Use same modal dialogs
- Use same toast notifications

### Responsive Design
- Test on mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Sidebar should collapse on mobile (already implemented)
- All lists should be scrollable on mobile
- Forms should stack on mobile

### Performance
- Lazy load routes where appropriate
- Implement pagination for large lists
- Use React Query or TanStack Query for data fetching (already available in project)
- Cache API responses where reasonable

---

## SPECIFIC TECHNICAL REQUIREMENTS

### File Structure to Create
```
src/
├── routes/_authenticated/
│   ├── doctor/
│   │   ├── dashboard.tsx
│   │   ├── patients.tsx
│   │   ├── pending-mri.tsx
│   │   ├── reviewed-analyses.tsx
│   │   ├── mri.$id.review.tsx
│   │   ├── support.tsx
│   │   └── profile.tsx
│   ├── admin/
│   │   ├── dashboard.tsx
│   │   ├── doctors.tsx
│   │   ├── patients.tsx
│   │   ├── assign-doctor.tsx
│   │   ├── support.tsx
│   │   ├── notifications.tsx
│   │   └── profile.tsx (optional)
├── components/
│   ├── doctor/
│   │   ├── DoctorReviewForm.tsx
│   │   └── DoctorPatientCard.tsx
│   ├── admin/
│   │   ├── AdminDoctorForm.tsx
│   │   ├── AdminAssignDoctorForm.tsx
│   │   └── ActivityFeed.tsx
│   ├── shared/
│   │   ├── SupportTicketList.tsx
│   │   └── SupportTicketThread.tsx
├── lib/
│   ├── api/
│   │   ├── doctor.ts
│   │   ├── admin.ts
│   │   ├── support.ts
│   │   └── notifications.ts
│   └── types/
│       ├── mri.ts
│       ├── doctor.ts
│       ├── admin.ts
│       ├── support.ts
│       └── notifications.ts
```

### Route Protection
- Ensure routes are protected by _authenticated layout ✅ (already done)
- Add role-based access control: redirect to login if role doesn't match
- Example: accessing /doctor/* as PATIENT should redirect to /patient/dashboard

### Navigation Flow
```
Public Pages:
  / → Landing
  /login → Login
  /register → Register

Patient Routes:
  /patient/dashboard → Dashboard
  /patient/upload-mri → Upload
  /patient/mri-history → History
  /patient/mri/:id → Details
  /patient/chatbot → Chatbot
  /patient/support → Support
  /patient/profile → Profile

Doctor Routes:
  /doctor/dashboard → Dashboard
  /doctor/patients → Patients
  /doctor/pending-mri → Pending
  /doctor/reviewed-analyses → Reviewed
  /doctor/mri/:id/review → Review
  /doctor/support → Support
  /doctor/profile → Profile

Admin Routes:
  /admin/dashboard → Dashboard
  /admin/doctors → Doctors
  /admin/patients → Patients
  /admin/assign-doctor → Assign
  /admin/support → Support
  /admin/notifications → Notifications
```

---

## PRIORITY ORDER

### Phase 1 (High Priority - Core Flows)
1. Update Sidebar/Navbar to be role-aware
2. Create doctor routes and dashboard
3. Create admin routes and dashboard
4. Create API modules (doctor.ts, admin.ts, support.ts, notifications.ts)

### Phase 2 (Medium Priority - Doctor Workflow)
1. Doctor assigned patients page
2. Doctor pending MRI page
3. Doctor review MRI page with notes textarea
4. Doctor reviewed analyses page
5. Doctor support page (can share with patient)

### Phase 3 (Medium Priority - Admin Workflow)
1. Admin doctors management page
2. Admin patients management page
3. Admin assign doctor page
4. Admin support page
5. Admin notifications page

### Phase 4 (Lower Priority - Polish)
1. Role-based route protection (redirect if wrong role)
2. Type definitions for all entities
3. Enhanced error handling
4. Loading states for all pages
5. Pagination for large lists

---

## IMPORTANT NOTES

### What NOT to Change
- ✅ Do NOT modify patient pages (dashboard, upload, history, details, etc.)
- ✅ Do NOT modify landing page, login, register
- ✅ Do NOT modify AuthContext unless adding new user properties
- ✅ Do NOT modify design system or existing colors/spacing
- ✅ Do NOT remove existing components

### What CAN Be Improved (Optional)
- Enhance Navbar with better breadcrumbs if needed
- Add more polish to existing patient pages
- Improve floating chatbot with additional features
- Add FAQ page if time permits

### Test Accounts (for manual testing)
- Patient: email/password from backend
- Doctor: email/password from backend
- Admin: email/password from backend

### Browser Testing
- Test role switching (logout patient, login as doctor, etc.)
- Verify navigation changes per role
- Check responsive behavior on mobile/tablet

---

## SUCCESS CRITERIA

✅ Doctor dashboard shows metrics and pending MRI list
✅ Doctor can view assigned patients
✅ Doctor can view pending MRI analyses
✅ Doctor can view reviewed analyses
✅ Doctor can review MRI and submit notes
✅ Doctor support tickets work
✅ Admin dashboard shows system metrics
✅ Admin can manage doctors (create/edit/delete)
✅ Admin can manage patients (view/assign/delete)
✅ Admin can assign doctors to patients
✅ Admin can view support tickets
✅ Admin notifications page functional
✅ Sidebar shows appropriate navigation per role
✅ Navbar shows appropriate titles per role
✅ All routes are protected (role-based redirect)
✅ No TypeScript errors
✅ No console errors
✅ Responsive on mobile/tablet/desktop
✅ Loading states show during API calls
✅ Error messages display on API failures
✅ Toast notifications work for all actions
✅ Application is ready for demo presentation

---

## ADDITIONAL CONTEXT

This prompt builds directly on the existing working patient implementation. The goal is to complete the platform by adding doctor and admin workflows while preserving all working patient functionality. The design system, routing structure, authentication, and API setup are all already in place—this is primarily about building out the missing routes, pages, and API functions while making the navigation role-aware.

