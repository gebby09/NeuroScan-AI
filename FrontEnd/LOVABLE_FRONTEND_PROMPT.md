# AI-Powered Brain Tumor MRI Analysis Platform - Frontend Development Prompt

## PROJECT OVERVIEW

This is a professional medical SaaS platform for AI-powered brain tumor MRI analysis with explainable AI (GradCAM visualization) and integrated doctor review workflows. The frontend integrates with a Spring Boot backend API and a Python FastAPI AI service.

**Backend Stack:**
- Spring Boot REST API (running on `http://localhost:8080`)
- PostgreSQL database
- JWT authentication
- Python FastAPI AI service for MRI analysis
- Google Gemini API for medical chatbot

**Application Type:** Multi-page medical dashboard application with role-based routing and authentication

---

## CORE ARCHITECTURE REQUIREMENTS

### 1. MULTI-PAGE APPLICATION STRUCTURE

This is a **TRUE multi-page application** with dedicated pages for each feature, NOT a single-page landing site.

**Folder Structure:**
```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── api/
│   │   ├── auth.ts
│   │   ├── patient.ts
│   │   ├── doctor.ts
│   │   ├── admin.ts
│   │   ├── mri.ts
│   │   ├── support.ts
│   │   ├── notifications.ts
│   │   └── chatbot.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── mri.ts
│   │   ├── user.ts
│   │   └── support.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ToastNotification.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── patient/
│   │   │   ├── MriUploadCard.tsx
│   │   │   ├── MriHistoryCard.tsx
│   │   │   └── MriDetailModal.tsx
│   │   ├── doctor/
│   │   │   ├── MriReviewCard.tsx
│   │   │   └── PatientCard.tsx
│   │   ├── admin/
│   │   │   ├── DoctorCard.tsx
│   │   │   ├── PatientCard.tsx
│   │   │   └── AssignDoctorModal.tsx
│   │   ├── support/
│   │   │   ├── SupportTicketList.tsx
│   │   │   ├── SupportMessageThread.tsx
│   │   │   └── CreateTicketModal.tsx
│   │   └── chatbot/
│   │       ├── ChatbotWindow.tsx
│   │       ├── ChatMessage.tsx
│   │       └── ChatInput.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── patient/
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── UploadMriPage.tsx
│   │   │   ├── MriHistoryPage.tsx
│   │   │   ├── MriDetailsPage.tsx
│   │   │   ├── ChatbotPage.tsx
│   │   │   ├── SupportTicketsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── doctor/
│   │   │   ├── DoctorDashboard.tsx
│   │   │   ├── AssignedPatientsPage.tsx
│   │   │   ├── PendingMriPage.tsx
│   │   │   ├── ReviewedAnalysesPage.tsx
│   │   │   ├── ReviewMriPage.tsx
│   │   │   ├── SupportPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── DoctorsManagementPage.tsx
│   │       ├── PatientsManagementPage.tsx
│   │       ├── AssignDoctorPage.tsx
│   │       ├── SupportTicketsPage.tsx
│   │       └── NotificationsPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMri.ts
│   │   ├── useNotifications.ts
│   │   └── useApi.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── utils/
│   │   ├── api.ts
│   │   ├── tokenStorage.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── styles/
│       ├── variables.css
│       ├── globals.css
│       └── animations.css
└── package.json
```

### 2. ROLE-BASED ROUTING

Implement protected routes with role-based access control:

```
PUBLIC PAGES:
  / → Landing Page
  /login → Login Page
  /register → Register Page
  /faq → FAQ Page

PATIENT ROUTES (protected, role=PATIENT):
  /patient/dashboard → Dashboard
  /patient/upload-mri → Upload MRI
  /patient/mri-history → MRI History
  /patient/mri/:id → MRI Details
  /patient/chatbot → AI Medical Chatbot
  /patient/support → Support Tickets
  /patient/profile → Profile

DOCTOR ROUTES (protected, role=DOCTOR):
  /doctor/dashboard → Dashboard
  /doctor/patients → Assigned Patients
  /doctor/pending-mri → Pending MRI Analyses
  /doctor/reviewed → Reviewed Analyses
  /doctor/mri/:id/review → Review MRI
  /doctor/support → Support Tickets
  /doctor/profile → Profile

ADMIN ROUTES (protected, role=ADMIN):
  /admin/dashboard → Dashboard
  /admin/doctors → Manage Doctors
  /admin/patients → Manage Patients
  /admin/assign-doctor → Assign Doctors
  /admin/support → Support Tickets
  /admin/notifications → Notifications
```

---

## BACKEND API INTEGRATION

### Authentication Endpoints
- `POST /auth/register` - Patient registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Patient Endpoints
- `POST /patient/mri/upload` - Upload MRI image
- `GET /patient/mri` - Get patient's MRI analyses
- `GET /patient/mri/history` - Get MRI history with details
- `GET /patient/my-doctor` - Get assigned doctor info
- `GET /patient/mri/:id/pdf` - Download MRI report as PDF

### Doctor Endpoints
- `GET /doctor/patients` - Get assigned patients
- `GET /doctor/mri/pending` - Get pending MRI analyses
- `POST /doctor/mri/:id/analyze` - Analyze MRI
- `POST /doctor/mri/:id/review` - Review and add notes

### Admin Endpoints
- `POST /admin/doctors` - Create doctor account
- `PUT /admin/patients/:id/assign-doctor/:doctorId` - Assign doctor to patient

### Support Endpoints
- `POST /support/tickets` - Create support ticket
- `GET /support/tickets` - Get user's tickets
- `POST /support/tickets/:id/messages` - Add message to ticket
- `GET /support/tickets/:id/messages` - Get ticket messages

### Notification Endpoints
- `GET /notifications` - Get user's notifications
- `PUT /notifications/:id/read` - Mark notification as read

### Chatbot Endpoint
- `POST /chatbot/ask` - Send message to Gemini AI medical assistant

---

## DESIGN SYSTEM

### Color Palette
- **Primary Blue:** `#0066FF` (main brand color, buttons, highlights)
- **Cyan Accent:** `#00D4FF` (accents, hover states)
- **Light Background:** `#F0F4F8` (page backgrounds)
- **Card Background:** `#FFFFFF` (white with subtle shadows)
- **Text Primary:** `#1A1A2E` (dark text on light)
- **Text Secondary:** `#666666` (lighter gray text)
- **Success Green:** `#10B981` (positive actions)
- **Warning Orange:** `#F59E0B` (alerts, warnings)
- **Error Red:** `#EF4444` (errors, danger)
- **Border Gray:** `#E5E7EB` (dividers, borders)

### Typography
- **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- **Heading (H1):** 32px, weight 700, line-height 1.3
- **Heading (H2):** 24px, weight 700, line-height 1.4
- **Heading (H3):** 18px, weight 600, line-height 1.5
- **Body:** 14px, weight 400, line-height 1.6
- **Small:** 12px, weight 400, line-height 1.5

### Component Styles
- **Border Radius:** 12px (cards), 8px (buttons), 4px (inputs)
- **Shadows:** 
  - Light: `0 1px 3px rgba(0, 0, 0, 0.1)`
  - Medium: `0 4px 6px rgba(0, 0, 0, 0.1)`
  - Heavy: `0 20px 25px rgba(0, 0, 0, 0.15)`
- **Spacing:** 4px base unit (4, 8, 12, 16, 24, 32, 40, 48px)
- **Transitions:** `all 0.3s ease-in-out`

### Glassmorphism
Apply glassmorphism to specific elements:
- Modal overlays: `backdrop-filter: blur(10px), background: rgba(255, 255, 255, 0.8)`
- Floating buttons: `background: rgba(255, 255, 255, 0.9), backdropFilter: blur(10px)`
- Navbar on scroll: `background: rgba(255, 255, 255, 0.95), backdropFilter: blur(10px)`

---

## PUBLIC PAGES

### Landing Page (`/`)

**Hero Section:**
- Full-width hero with gradient background (blue to cyan)
- Title: "AI-Powered Brain Tumor MRI Analysis Platform"
- Subtitle: "Advanced MRI analysis with explainable AI visualization and medical workflow support."
- Two CTA buttons: "Get Started" → /register, "Sign In" → /login
- Subtle animated icon (brain with neural network animation)
- Animated floating elements in background

**Features Section:**
Display 8 feature cards in a 2x4 grid (responsive):
1. **AI MRI Analysis** - Automated tumor detection using TensorFlow
2. **GradCAM Visualization** - Explainable AI showing analyzed regions
3. **Doctor Review Workflow** - Secure doctor review and approval process
4. **PDF Reports** - Downloadable medical reports
5. **Notifications** - Real-time alerts for analyses and reviews
6. **Medical AI Chatbot** - 24/7 healthcare information assistant
7. **Secure Healthcare Platform** - HIPAA-compliant data protection
8. **Support Ticket System** - Integrated customer support

Each card should have:
- Icon (use Lucide React icons)
- Title
- Description
- Hover effect (scale up slightly, shadow increase)

**How It Works Section:**
5-step process with animated flow:
1. Upload MRI → (arrow) →
2. AI Analysis → (arrow) →
3. GradCAM Visualization → (arrow) →
4. Doctor Review → (arrow) →
5. Download PDF Report

Each step has an icon and brief description.

**FAQ Section:**
Generate ~20 realistic FAQ items covering:
- AI analysis capabilities and limitations
- GradCAM visualization explanation
- Privacy and data security
- Chatbot limitations and medical disclaimers
- Notification system
- Doctor workflow
- PDF report generation
- MRI upload requirements
- Account management
- Healthcare disclaimers

Implement expandable accordion UI with smooth animations.

**Healthcare Disclaimers:**
Display multiple disclaimers throughout landing page:
- "AI analysis is supportive only and does not replace licensed doctors"
- "The chatbot provides informational content only"
- "Always consult medical professionals for diagnosis"
- "This platform is for educational and research purposes"

**Footer:**
- Links: About, Contact, Privacy Policy, Terms, FAQ
- Social links (GitHub, Twitter, etc.)
- Copyright notice
- Contact email

### Login Page (`/login`)

**Form Layout:**
- Centered card on light background
- Logo at top
- Title: "Welcome Back"
- Email input field with validation
- Password input field with show/hide toggle
- Remember me checkbox
- Sign In button
- Link to register: "Don't have an account? Sign up"

**Features:**
- Form validation with error messages
- Loading state on button during login
- Toast notification on successful login
- Redirect to appropriate dashboard based on role
- Forgot password link (can be disabled initially)

### Register Page (`/register`)

**Patient Registration Form:**
- Centered card on light background
- Title: "Create Your Account"
- Multi-step form or single form with sections

**Form Fields:**
- First Name (text input)
- Last Name (text input)
- Email (email input with validation)
- Password (password input with strength indicator)
- Phone Number (formatted input)
- Date of Birth (date picker)
- Biological Sex (toggle: Male/Female)
- Height in cm (number input)
- Weight in kg (number input)
- Medical History (textarea with placeholder)
- Address (text input)

**Features:**
- Real-time form validation
- Password strength indicator
- Terms & conditions checkbox
- Create Account button
- Link to login: "Already have an account? Sign in"
- Loading state during registration
- Success toast notification
- Redirect to login after successful registration

---

## AUTHENTICATION & NAVIGATION

### Navbar (for authenticated pages)

**Design:**
- Fixed at top with subtle glassmorphism effect
- Light background with shadow

**Contents (Left to Right):**
- Logo/Platform name with icon
- Navigation breadcrumb or current page name

**Contents (Right to Left):**
- Notification bell icon
  - Unread badge counter (red circle with number)
  - Click to show dropdown with 5 most recent notifications
  - Link to full notifications page
- User avatar (circle with initials)
  - Click to show dropdown menu
- Username (optional)
- Logout button

**Avatar Dropdown Menu:**
- Profile
- Settings (if applicable)
- Logout

### Sidebar Navigation (for authenticated dashboard pages)

**Design:**
- Fixed left sidebar (250px wide)
- Dark theme or light theme with blue accents
- Collapsible on mobile
- Sticky position
- Professional medical aesthetic

**Sidebar Features:**
- Logo and platform name at top
- Navigation items with icons
- Active route highlighting (blue left border)
- Hover effects (background color change)
- User info section at bottom (avatar, name, role)
- Logout button at bottom

---

## PATIENT PAGES

### Patient Dashboard (`/patient/dashboard`)

**Layout:**
- Navbar at top
- Sidebar on left (navigation)
- Main content area

**Dashboard Cards (Grid Layout):**
Display 4 metric cards:
1. **Total MRI Analyses** - Large number
2. **Pending Reviews** - MRI analyses awaiting doctor review
3. **Reviewed Analyses** - Completed reviews by doctor
4. **Assigned Doctor** - Doctor name with link to doctor profile

**Quick Action Buttons:**
- Upload New MRI (blue, goes to upload page)
- View MRI History (secondary, goes to history page)
- Contact Doctor (secondary)
- Get Support (secondary)

**Recent MRI Analyses (Recent Card):**
- Show 3 most recent MRI analyses
- Small cards with prediction, status, date
- Click to view details

**Healthcare Disclaimer Card:**
- Display notice: "AI analysis is supportive only and does not replace professional medical diagnosis"

### Upload MRI Page (`/patient/upload-mri`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Healthcare Disclaimer:**
- Prominent warning box at top
- "This AI analysis is for informational purposes and does not replace licensed medical professionals"
- "Always consult your assigned doctor for medical advice"

**Upload Section:**

**Drag and Drop Area:**
- Large rectangle (400px height)
- Dotted blue border
- Icon (upload cloud icon)
- Text: "Drag and drop your MRI image here or click to browse"
- Accepted formats: .png, .jpg, .jpeg, .dicom (show list)

**File Preview:**
- After file selection, show:
  - Image preview (if image file)
  - File name
  - File size
  - Resolution/dimensions

**Upload Progress:**
- During upload, show progress bar
- Loading animation
- Percentage complete
- Estimated time remaining (if available)

**Submit Button:**
- "Analyze MRI" button (blue, disabled until file selected)
- Loading state with spinner

**Loading State After Upload:**
- Show loading animation with skeleton loaders
- Skeleton cards for where results will appear
- Message: "Analyzing your MRI... This may take 1-2 minutes"

**Success State:**
- Confirmation toast notification
- Show analysis ID
- "View Results" button redirects to MRI Details page
- "Upload Another" button to upload more MRIs

### MRI History Page (`/patient/mri-history`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Search and Filter:**
- Search bar (search by prediction, date)
- Filter by status: All, Pending, Analyzed, Reviewed

**MRI History List/Cards:**
Display as cards in grid or table format:
- **MRI Image Thumbnail** (small preview)
- **Prediction** (e.g., "Tumor Detected" or "No Tumor")
- **Confidence** (percentage with visual bar)
- **Status** (badge: PENDING, ANALYZED, REVIEWED)
- **Created Date** (formatted date)
- **Doctor Name** (if reviewed, show doctor name)
- **Doctor Notes Preview** (first 100 characters with "..." if longer)

**Action Buttons per card:**
- "View Details" (blue button)
- "Download PDF" (secondary button)

**Empty State:**
- Show empty state if no MRI analyses
- Icon, message, button to upload first MRI

**Pagination:**
- Show 10 items per page
- Pagination controls at bottom

### MRI Details Page (`/patient/mri/:id`)

**Design:** Make this page visually impressive and professional.

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area with two-column layout

**Left Column:**
- **Original MRI Image:**
  - Display full MRI image
  - Responsive, maintains aspect ratio
  - Hover effects (zoom, lightbox)
  - Professional gray background

**Right Column:**
- **Analysis Results Card:**
  - **Prediction:** Large text (e.g., "Tumor Detected")
  - **Confidence:** Percentage with colored progress bar (red if high risk, green if low)
  - **Probability:** Percentage value
  - **Status:** Badge (PENDING, ANALYZED, REVIEWED)
  - **Timestamp:** Date and time of analysis

- **Doctor Information Card:**
  - Doctor name with avatar/initials
  - Doctor license number
  - Button to contact doctor

- **Doctor Notes Card:**
  - Title: "Doctor Review Notes"
  - Notes text (if available)
  - Date/time of review

**Full-Width Section Below:**

**GradCAM Visualization:**
- Title: "AI Analysis Visualization (GradCAM)"
- Display GradCAM image side-by-side with original MRI
- Explanation: "Highlighted areas show where the AI model focused for the analysis"
- Smooth transitions and hover effects

**Action Buttons:**
- "Download PDF Report" (blue button)
- "Back to History" (secondary button)
- "Share with Doctor" (secondary button - if not already reviewed)

**Medical Disclaimer:**
- Display disclaimer at bottom of page
- "This analysis is AI-generated and should be reviewed by a licensed medical professional"

### Chatbot Page (`/patient/chatbot`) or Floating Chatbot

**Option 1 - Dedicated Page:**
- Navbar at top
- Sidebar on left
- Main content area with chat interface

**Option 2 - Floating Component (Recommended):**
- Floating button in bottom-right corner of ALL authenticated pages
- Robot icon with label "AI Assistant"
- Click to expand/minimize chat window

**Chatbot Window:**
- Fixed size (400px width, 500px height on desktop, responsive on mobile)
- Floating position (bottom-right with margin from edges)
- Draggable header

**Chat Interface:**
- **Header:** "AI Medical Assistant" with close button
- **Disclaimer:** Small text at top: "Informational only. Not a replacement for professional medical advice."
- **Chat Messages:**
  - User messages: right-aligned, blue background
  - Bot messages: left-aligned, gray background
  - Timestamp for each message
  - Avatar (icon) for bot
- **Typing Indicator:** Animated dots when AI is responding
- **Message Input:** Text area with send button at bottom
- **Clear Chat** Option: Button to clear conversation history

**Features:**
- Smooth animations when opening/closing
- Minimize button to collapse
- Auto-scroll to latest message
- Disable input while waiting for response
- Show loading spinner during API call

---

## DOCTOR PAGES

### Doctor Dashboard (`/doctor/dashboard`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Dashboard Cards (Grid Layout):**
Display metric cards:
1. **Assigned Patients** - Total number of patients
2. **Pending MRI Analyses** - MRIs awaiting review
3. **Reviewed Analyses** - Completed reviews
4. **Total Analyses This Month** - This month's count

**Recent Pending MRI Analyses (Card):**
- Show 5 most recent pending MRI analyses
- Patient name, MRI ID, prediction, date uploaded
- Click row to go to review page

**Quick Action Buttons:**
- View Pending MRI (blue, goes to pending page)
- View Patients (secondary)
- View Support Tickets (secondary)

### Assigned Patients Page (`/doctor/patients`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Search and Filter:**
- Search bar (search by patient name, email)
- Sort options (by name, by date added)

**Patients List:**
Display as cards or table:
- Patient avatar (initials)
- Patient name
- Email
- Date assigned to doctor
- Number of MRI analyses
- Last analysis date

**Action Buttons per patient:**
- "View Patient Analyses" (blue button)
- "View Patient Profile" (secondary)

**Empty State:**
- Show if no patients assigned
- Message and icon

### Pending MRI Page (`/doctor/pending-mri`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Filter Options:**
- Sort by date uploaded, patient name
- Status filter

**Pending MRI List:**
Display as cards in grid or table:
- Patient name
- Patient avatar
- MRI ID
- Date uploaded
- Prediction (from AI)
- Confidence score
- Status badge: "PENDING REVIEW"

**Action Buttons per card:**
- "Review MRI" (blue button) → goes to review page
- "View Patient Info" (secondary)

**Empty State:**
- Show if no pending MRIs
- Icon and message

### Reviewed Analyses Page (`/doctor/reviewed-analyses`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Filter and Sort:**
- Sort by review date, patient name
- Filter by status (Analyzed, Reviewed)

**Reviewed Analyses List:**
Display as cards or table:
- Patient name
- Patient avatar
- MRI ID
- Prediction
- Confidence
- Review date
- Status badge: "REVIEWED"

**Action Buttons per card:**
- "View Details" (blue button)
- "Download Report" (secondary)

### Review MRI Page (`/doctor/mri/:id/review`)

**Design:** Professional review interface

**Layout:**
- Navbar at top
- Sidebar on left
- Two-column layout

**Left Column:**
- **Original MRI Image:**
  - Display MRI image
  - Full responsive size
  - Professional gray background

**Right Column:**
- **MRI Analysis Results Card:**
  - AI Prediction (e.g., "Tumor Detected")
  - Confidence percentage with bar
  - Probability value
  - AI Analysis Status

- **Patient Information Card:**
  - Patient name with avatar
  - Email
  - Phone
  - Assigned date
  - Link to patient profile

**Full-Width Section Below:**

**GradCAM Visualization:**
- Display GradCAM image side-by-side with original MRI
- Explanation of highlighted areas

**Doctor Notes Section:**
- **Text Area:** Large textarea for doctor's clinical notes and observations
- **Placeholder:** "Enter your medical assessment, diagnosis notes, and any recommendations for the patient..."
- Character limit indicator (e.g., 0/1000)
- Formatting toolbar (optional: bold, italic, bullet points)

**Action Buttons:**
- "Submit Review" (blue button, confirms review)
- "Save as Draft" (secondary button)
- "Back to Pending" (secondary button)

**Confirmation Dialog:**
- When submitting review, show confirmation dialog
- Message: "Review this analysis for patient?"
- Buttons: Confirm, Cancel

**Success State:**
- Toast notification: "Review submitted successfully"
- Redirect to pending page or show success message

---

## ADMIN PAGES

### Admin Dashboard (`/admin/dashboard`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Dashboard Cards (Grid Layout):**
Display metric cards:
1. **Total Doctors** - Active doctors in system
2. **Total Patients** - Registered patients
3. **Total MRI Analyses** - All-time total
4. **Open Support Tickets** - Active support tickets

**Recent Activity Panel:**
- Show 10 most recent activities
- Activity type icon
- Description
- Timestamp
- Scrollable list

**Quick Action Buttons:**
- Add Doctor (blue, opens modal)
- View All Patients (secondary)
- View Support Tickets (secondary)
- System Status (secondary)

### Doctors Management Page (`/admin/doctors`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Search and Filter:**
- Search bar (search by doctor name, email, license number)
- Sort by name, date added, patient count

**Doctors List:**
Display as table or cards:
- Doctor avatar (initials)
- Doctor name
- Email
- License number
- Patients assigned (count)
- Date created
- Status (active/inactive)

**Action Buttons per row:**
- "Edit" (secondary button)
- "View Patients" (secondary button)
- "Delete" (danger button with confirmation)

**Create Doctor Button:**
- Blue button at top-right: "Add New Doctor"
- Opens modal with form

**Create Doctor Modal:**
- Form fields (First Name, Last Name, Email, Password, Phone, License Number)
- Validation
- Submit button
- Cancel button

**Empty State:**
- Show if no doctors
- Icon and "Create First Doctor" button

### Patients Management Page (`/admin/patients`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Search and Filter:**
- Search bar (search by patient name, email)
- Filter by doctor assigned (dropdown)
- Filter by status (all, with doctor, unassigned)
- Sort by name, date registered

**Patients List:**
Display as table or cards:
- Patient avatar (initials)
- Patient name
- Email
- Assigned Doctor (if any)
- MRI analyses count
- Date registered
- Status badge

**Action Buttons per row:**
- "View Profile" (secondary button)
- "Assign Doctor" (blue button if no doctor assigned)
- "View Analyses" (secondary button)
- "Delete" (danger button with confirmation)

**Empty State:**
- Show if no patients

### Assign Doctor Page (`/admin/assign-doctor`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Two-Column Layout:**

**Left Column:**
- **Select Patient:**
  - Dropdown/searchable select with patient names
  - Show email and MRI count
  - Filter unassigned patients option

**Right Column:**
- **Select Doctor:**
  - Dropdown/searchable select with doctor names
  - Show license number and current patient count
  - Filter by specialty (optional)

**Assignment Details:**
- Show patient and doctor info clearly
- Confirmation message

**Action Buttons:**
- "Assign Doctor" (blue button, disabled until both selected)
- "Cancel" (secondary button)

**Recent Assignments:**
- Show table of recent doctor-patient assignments
- Patient name, Doctor name, Date assigned, Doctor name
- Reverse assignment option

**Confirmation Dialog:**
- When assigning, show confirmation
- Message: "Assign Dr. [Name] to [Patient Name]?"
- Buttons: Confirm, Cancel

**Success State:**
- Toast notification: "Doctor assigned successfully"
- Send notification to patient

### Support Tickets Page (`/admin/support`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Filter and Search:**
- Search bar (search by ticket ID, subject, user name)
- Filter by status (OPEN, CLOSED)
- Sort by date created, most recent

**Support Tickets List:**
Display as table:
- Ticket ID
- User name (patient)
- Subject
- Status badge (OPEN=orange, CLOSED=green)
- Created date
- Last message date
- Unread messages count (if any)

**Action Buttons per row:**
- "View Ticket" (blue button) → opens full thread
- "Close Ticket" (if OPEN) - shows confirmation
- "Reopen Ticket" (if CLOSED) - shows confirmation

**View Ticket Modal/Page:**
- Title and ID
- User information
- All messages in thread
- Reply text area
- Send message button
- Close ticket button

**Empty State:**
- Show if no tickets

---

## SUPPORT & NOTIFICATIONS FEATURES

### Support Ticket System

**Create Support Ticket Modal:**
- Trigger: "Contact Support" button from any authenticated page
- Modal overlay with glassmorphism
- Title: "Create Support Ticket"
- Form fields:
  - Subject (text input)
  - Message (textarea)
- Submit and Cancel buttons
- Loading state

**Support Tickets Page (`/patient/support` or `/doctor/support`):**

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Create Ticket Button:**
- Blue button at top-right

**Tickets List:**
Display as cards or table:
- Ticket ID
- Subject
- Status (OPEN, CLOSED badge)
- Created date
- Last message date
- Preview of last message

**Action Buttons per ticket:**
- "View" (blue button) → opens full thread

**View Ticket Thread:**
- Ticket ID and subject at top
- Messages in chronological order
  - Admin/support messages: left-aligned, gray background, "SUPPORT" badge
  - User messages: right-aligned, blue background
  - Timestamps
  - Avatars (initials)
- Reply text area at bottom
- Send button
- Close ticket button (if OPEN)

**Empty State:**
- Show if no support tickets
- Icon, message, "Create First Ticket" button

### Notifications System

**Notification Bell (in Navbar):**
- Bell icon (Lucide React)
- Red badge with unread count (if > 0)
- Click to open dropdown

**Notification Dropdown:**
- Title: "Notifications"
- Show 5 most recent notifications
- Each notification:
  - Icon (based on type)
  - Title
  - Message
  - Timestamp (relative, e.g., "2 hours ago")
  - Unread indicator (small blue dot)
- "View All" link → goes to notifications page
- "Mark All as Read" link
- Close button

**Notifications Page (`/notifications` or within dashboard):**

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Filter Options:**
- Filter by type (all, system, patient, doctor, admin)
- Filter by read status (all, unread, read)
- Sort by date (newest first, oldest first)

**Notifications List:**
Display as cards or table:
- Icon
- Title
- Message (preview)
- Timestamp
- Read/unread indicator
- Mark as read/unread button

**Action per notification:**
- Click to mark as read/unread
- Click message to navigate to relevant page if applicable

**Empty State:**
- Show if no notifications
- Icon and message

**Toast Notifications:**
- Use small toast popups for real-time notifications
- Position: top-right
- Auto-dismiss after 5 seconds
- Types: success (green), error (red), warning (orange), info (blue)

---

## CHATBOT IMPLEMENTATION

### AI Medical Chatbot

**Floating Button (Bottom-Right):**
- Green circle with robot icon
- Label: "AI Medical Assistant"
- Hover effect (scale, shadow increase)

**Chat Window:**
- Title bar: "AI Medical Assistant"
- Close button (X)
- Minimize button (_)
- Draggable
- Glassmorphism background

**Chat Interface:**
- **Disclaimer at top:**
  - "This assistant provides information only and is not a substitute for professional medical advice"
- **Message Thread:**
  - User messages: right-aligned, blue bubble
  - AI messages: left-aligned, white/gray bubble
  - Robot avatar for AI
  - Timestamps
- **Typing Indicator:** Animated dots while AI responds
- **Input Area:**
  - Text input field
  - Send button (paper plane icon)
  - Disabled while waiting for response

**Features:**
- Auto-scroll to latest message
- Clear chat option in header
- Character limit (~500 chars per message)
- Disable input during loading
- Error state if API fails
- Smooth open/close animations

---

## PROFILE PAGES

### User Profile Page (`/patient/profile`, `/doctor/profile`)

**Layout:**
- Navbar at top
- Sidebar on left
- Main content area

**Content:**

**Profile Information Card:**
- Avatar (initials in circle)
- Name
- Email
- Phone number
- Role

**Edit Profile Section:**
- Edit button → opens form or editable fields
- First Name field
- Last Name field
- Phone Number field
- Patient-specific fields (if patient):
  - Date of Birth
  - Height
  - Weight
  - Medical History
  - Biological Sex
- Doctor-specific fields (if doctor):
  - License Number

**Save Changes Button:**
- Blue button
- Loading state
- Toast notification on success

**Password Change Section:**
- Current Password field
- New Password field
- Confirm Password field
- Change Password button

**Logout Button:**
- Red/danger button at bottom
- Confirmation dialog before logout

**Logout Confirmation Dialog:**
- Message: "Are you sure you want to log out?"
- Buttons: Confirm, Cancel

---

## UI COMPONENTS & PATTERNS

### Loading States
- Skeleton loaders for data-heavy components
- Spinning loader animation for async operations
- Progress bars for file uploads
- Pulse animations for pending items

### Empty States
- Icon representing the empty state
- Friendly message
- Call-to-action button when applicable
- Illustration or gradient background

### Toast Notifications
- Small card appearing from top-right
- Different colors for success, error, warning, info
- Auto-dismiss after 5 seconds
- Close button
- Stack multiple toasts

### Confirmation Dialogs
- Modal overlay with blur/glassmorphism
- Title and message
- Action buttons (typically "Confirm" and "Cancel")
- Danger button for destructive actions (red)

### Error States
- Error message display
- Retry button when applicable
- Contact support link

### Hover Effects
- Subtle scale (1.02x) and shadow increase on cards
- Color transition on buttons
- Underline on links
- Smooth 0.3s transition

### Animations
- Fade in/fade out for modals and toasts
- Slide in for sidebars and drawers
- Scale animations for buttons on hover
- Smooth transitions between pages
- Pulse animation for pending notifications

### Status Badges
- PENDING: Orange/amber background
- ANALYZED: Blue background
- REVIEWED: Green background
- OPEN: Orange/amber background
- CLOSED: Gray background
- Use appropriate text colors for contrast

### Icons
Use Lucide React icons throughout:
- Upload cloud icon (upload)
- Download icon (download)
- Bell icon (notifications)
- Menu icon (hamburger for mobile)
- User icon (profile)
- Logout icon (sign out)
- Brain icon (MRI, platform logo)
- Robot icon (chatbot)
- Checkmark icon (success)
- X icon (close/error)
- Search icon (search)
- Filter icon (filter)
- Plus icon (add/create)
- Trash icon (delete)
- Eye icon (view)
- Lock icon (secure/protected)

---

## RESPONSIVE DESIGN

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Optimizations
- Collapsible sidebar (hamburger menu)
- Full-width cards and inputs
- Stack two-column layouts vertically
- Larger touch targets (44px minimum)
- Scrollable tables/lists
- Bottom navigation option (instead of sidebar)
- Optimized images and file sizes
- Touch-friendly buttons and dropdowns

### Tablet Optimizations
- Flexible sidebar (can collapse)
- 2-column layouts where appropriate
- Balanced card layouts

### Desktop Features
- Fixed sidebar
- Multi-column layouts
- Hover effects
- Tooltip support

---

## SECURITY & BEST PRACTICES

### Authentication
- JWT token stored in localStorage or sessionStorage
- Include token in Authorization header for API requests
- Logout clears token
- Redirect to login if token expires
- Protect routes with authentication checks

### API Integration
- Base URL: `http://localhost:8080`
- All requests include JWT token
- Error handling with user-friendly messages
- Retry logic for failed requests
- Request/response interceptors

### Data Security
- Never log sensitive data
- Sanitize user input
- HTTPS recommended for production
- CSP headers
- XSS protection

### Role-Based Access Control
- Check user role before rendering protected pages
- Disable access to pages user doesn't have permission for
- Hide UI elements based on role
- Backend validates all requests

---

## DEVELOPMENT GUIDELINES

### Tech Stack (Recommended)
- **Frontend Framework:** React 18+ with TypeScript
- **Routing:** React Router v6
- **State Management:** Context API or TanStack Query
- **HTTP Client:** Axios or Fetch API
- **UI Components:** Lucide React for icons
- **Styling:** Tailwind CSS or styled-components
- **Forms:** React Hook Form with Zod/Yup validation
- **Toast Notifications:** react-toastify or similar
- **Build Tool:** Vite

### Project Setup
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npm install axios lucide-react react-router-dom react-hook-form react-toastify
npm run dev
```

### API Base URL Configuration
```typescript
// utils/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Environment Variables
```
VITE_API_BASE_URL=http://localhost:8080
VITE_CHATBOT_ENABLED=true
```

### Code Organization
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use TypeScript for type safety
- Use constants for magic strings
- Implement error boundaries
- Use lazy loading for routes

### Performance Optimization
- Code splitting for pages
- Image optimization
- Memoization for expensive computations
- Virtual scrolling for long lists
- Debouncing for search/filter inputs
- Caching API responses where appropriate

### Testing (Optional but Recommended)
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- E2E tests with Playwright or Cypress
- Aim for 70%+ coverage

---

## IMPORTANT NOTES

### Local Development
- Backend runs on `http://localhost:8080`
- Frontend runs on `http://localhost:5173` (Vite default)
- PostgreSQL database configured in `application.properties`
- Python FastAPI service for MRI analysis (localhost:8000 assumed)
- CORS configured on backend to allow frontend requests

### Deployment Considerations
- Build frontend for production: `npm run build`
- Output to `dist/` directory
- Can be served by backend as static files or deployed separately
- Update environment variables for production URLs
- Consider Docker containerization

### Browser Support
- Chrome, Edge, Safari (latest 2 versions)
- Firefox (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Sufficient color contrast
- Focus indicators
- Alt text for images

### Known Limitations & Disclaimers
- The platform must repeatedly clarify that AI analysis is supportive only
- Chatbot is informational and not a medical professional
- Users must consult licensed doctors for medical advice
- Platform is for educational/research purposes
- Data privacy is critical for healthcare compliance

---

## LOGO & BRANDING

### Logo Design
- Minimal, modern design
- Combine brain icon with neural network/AI elements
- Use primary blue (#0066FF) and cyan (#00D4FF)
- Should work at favicon size (16x16)
- Should scale well from favicon to navbar size
- Professional medical aesthetic

### Logo Usage
- Navbar: 32x32px
- Favicon: 16x16px
- Landing page hero: up to 100x100px
- All authenticated pages: in sidebar (32x32px)

### Logo Files
- SVG for vector use (scales infinitely)
- PNG fallback (16x16, 32x32, 64x64, 128x128)
- Favicon.ico (16x16, 32x32)

---

The UI should feel similar to modern healthcare SaaS platforms such as Stripe-style dashboards mixed with modern medical applications.

Avoid generic templates or overly colorful gaming aesthetics.

Focus on:
- trust
- clarity
- professionalism
- clean whitespace
- premium UI polish
- smooth user experience
- modern healthcare branding

The application should visually feel:
- secure
- intelligent
- modern
- medical-grade
- polished enough for a professional thesis/demo presentation

The design should resemble a real-world startup healthcare platform rather than a student project.

## SUCCESS CRITERIA

The frontend is considered complete when:

✅ All public pages (landing, login, register) are fully functional
✅ Authentication flow works correctly with JWT
✅ Patient dashboard and all patient pages are implemented
✅ Doctor dashboard and all doctor pages are implemented
✅ Admin dashboard and all admin pages are implemented
✅ Support ticket system works end-to-end
✅ Notification system displays and manages notifications
✅ Chatbot integration works with Gemini API
✅ MRI upload and analysis flow is complete
✅ MRI details page displays images and GradCAM visualization
✅ All forms have proper validation
✅ Responsive design works on mobile, tablet, desktop
✅ Loading states and empty states are handled
✅ Error states show helpful messages
✅ Toast notifications appear for user feedback
✅ Sidebar navigation works for all authenticated pages
✅ Logout functionality works
✅ Protected routes prevent unauthorized access
✅ Role-based routing works correctly
✅ Medical disclaimers are displayed appropriately
✅ UI is professional, modern, and cohesive
✅ All interactive elements have appropriate hover/focus states
✅ Performance is optimized (fast page loads, smooth transitions)
✅ No console errors or warnings
✅ Accessibility requirements are met
✅ Application is ready for thesis/demo presentation

---

## FINAL NOTES

This is a comprehensive medical SaaS platform that requires attention to detail, professional UI design, and robust functionality. The frontend should feel polished, secure, and trustworthy—critical factors in healthcare applications.

The multi-page architecture with role-based routing ensures proper separation of concerns and provides each user type with a tailored experience. All disclaimers and security notices should be prominent to meet healthcare compliance standards.

The integration with the Spring Boot backend should be seamless, with proper error handling, loading states, and user feedback throughout the application flow.

Good luck with your thesis project! This platform demonstrates advanced full-stack development skills and healthcare application design principles.
