# Frontend Integration Guide - Medical MRI Analysis Backend

**Document Version:** 1.0  
**Backend Type:** Spring Boot REST API  
**Base URL:** `http://localhost:8080` (default)  
**Frontend Base URL:** `http://localhost:8081` (CORS configured)

---

## Table of Contents

1. [Authentication & Security](#authentication--security)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Doctor Endpoints](#doctor-endpoints)
5. [Patient Endpoints](#patient-endpoints)
6. [Notification Endpoints](#notification-endpoints)
7. [Support Ticket Endpoints](#support-ticket-endpoints)
8. [Admin Support Endpoints](#admin-support-endpoints)
9. [Chatbot Endpoints](#chatbot-endpoints)
10. [User Endpoints](#user-endpoints)
11. [Test Endpoints](#test-endpoints)
12. [Data Models](#data-models)
13. [Error Handling](#error-handling)
14. [CORS Configuration](#cors-configuration)

---

## Authentication & Security

### JWT Token Implementation

The backend uses **JWT (JSON Web Tokens)** for stateless authentication:

- **Token Type:** Bearer Token (JWT)
- **Token Header:** `Authorization: Bearer <token>`
- **Expiration:** 24 hours (86400000 milliseconds)
- **Algorithm:** HS256
- **Token Claims:**
  - `sub` (subject): User email
  - `id`: User ID
  - `role`: User role (PATIENT, DOCTOR, ADMIN)
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp

### Request Headers

All authenticated endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Security Configuration

- **CSRF:** Disabled (for REST API)
- **Session:** Stateless (SessionCreationPolicy.STATELESS)
- **Public Endpoints:**
  - `/auth/login`
  - `/auth/register`
  - `/setup/**` (admin registration)
  - `/v3/api-docs/**` (OpenAPI)
  - `/swagger-ui/**` (Swagger UI)
  - `/swagger-ui.html`

### Role-Based Access Control (RBAC)

Three roles with different permissions:

| Role | Permissions |
|------|-------------|
| **ADMIN** | Create doctors, assign doctors to patients, manage support tickets |
| **DOCTOR** | View assigned patients, analyze MRI images, review MRI analysis, reply to support tickets |
| **PATIENT** | Upload MRI images, view doctor info, track MRI history, create support tickets |

---

## Authentication Endpoints

### 1. Patient Registration

**Endpoint:** `POST /auth/register`

**Authentication:** Not required (public)

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phoneNumber": "0712345678",
  "dateOfBirth": "1990-05-15",
  "biologicalSex": "MALE",
  "heightCm": 180,
  "weightKg": 75.5,
  "address": "123 Main Street, City"
}
```

**Request Validation:**

- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `email`: Required, valid email format, must be unique
- `password`: Required, 6-100 characters
- `phoneNumber`: Required, 10-15 characters
- `dateOfBirth`: Required, ISO format (YYYY-MM-DD)
- `biologicalSex`: Required, enum (MALE, FEMALE)
- `heightCm`: Required, integer 50-300
- `weightKg`: Required, decimal ≥ 1.0
- `address`: Optional, string

**Response (201 Created):**

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "PATIENT",
  "message": "Patient registered successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "Email already exists"
}
```

**Expected Frontend Behavior:**

- Validate all required fields before submission
- Display error message if email already exists
- Store registration response for confirmation
- Redirect to login page on success
- Display success notification

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Authentication:** Not required (public)

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Request Validation:**

- `email`: Required, valid email format
- `password`: Required, 6-100 characters

**Response (200 OK):**

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "PATIENT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "message": "Invalid email or password"
}
```

**Expected Frontend Behavior:**

- Validate email and password format
- Store JWT token in secure storage (localStorage or sessionStorage)
- Store user information (id, role, name)
- Include Authorization header in all subsequent requests
- Redirect to dashboard based on user role
- Set up automatic logout on token expiration
- Handle token refresh if implementing sliding expiration

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Authentication:** Required (JWT token)

**Role Requirements:** All authenticated users

**Request Body:** None

**Response (200 OK):**

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "PATIENT",
  "phoneNumber": "0712345678"
}
```

**Error Response (401 Unauthorized):** Token missing or invalid

**Expected Frontend Behavior:**

- Call this endpoint on app initialization to validate token
- Use response to populate user profile
- Handle 401 response by redirecting to login
- Display current user information in UI

---

## Admin Endpoints

### 1. Register Admin (Initial Setup)

**Endpoint:** `POST /setup/register-admin`

**Authentication:** Not required (public - initial setup only)

**Setup Code Security:**

- A setup code is required to create the first admin account
- Setup codes are seeded in the database by `SetupCodeSeeder`
- Each code is hashed using BCrypt
- Failed attempts are tracked (max 3 attempts)
- After 3 failed attempts, code is locked for 10 minutes
- Each code can only be used once

**Request Body:**

```json
{
  "setupCode": "SETUP-CODE-VALUE",
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "SecureAdminPassword123",
  "phoneNumber": "0723456789"
}
```

**Request Validation:**

- `setupCode`: Required, must match hashed code
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `email`: Required, valid email, must be unique
- `password`: Required, 6-100 characters
- `phoneNumber`: Required, 10-15 characters

**Response (201 Created):**

```json
{
  "id": 1,
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "role": "ADMIN",
  "message": "Admin registered successfully"
}
```

**Error Responses:**

```json
{
  "message": "Email already exists"
}
```

```json
{
  "message": "An admin account already exists"
}
```

```json
{
  "message": "No valid setup code available"
}
```

```json
{
  "message": "Setup code is locked due to too many failed attempts. Please try again later",
  "status": 429
}
```

```json
{
  "message": "Invalid setup code",
  "status": 401
}
```

**Expected Frontend Behavior:**

- Display setup wizard for initial admin creation
- Only show on first application launch
- Show setup code input field
- Display attempts remaining if code fails
- Show lock message with remaining lock time
- Redirect to admin dashboard on success

---

### 2. Create Doctor

**Endpoint:** `POST /admin/doctors`

**Authentication:** Required (JWT token)

**Role Requirements:** ADMIN only

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@hospital.com",
  "password": "DoctorPassword123",
  "phoneNumber": "0734567890",
  "licenseNumber": "LIC-2024-001"
}
```

**Request Validation:**

- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `email`: Required, valid email, must be unique
- `password`: Required, 6-100 characters
- `phoneNumber`: Required, 10-15 characters
- `licenseNumber`: Required, string (format depends on healthcare system)

**Response (201 Created):**

```json
{
  "id": 2,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@hospital.com",
  "role": "DOCTOR",
  "licenseNumber": "LIC-2024-001",
  "message": "Doctor created successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "Email already exists"
}
```

**Error Response (403 Forbidden):**

```json
{
  "message": "Access Denied"
}
```

**Expected Frontend Behavior:**

- Only accessible to admin users
- Display form for doctor creation
- Validate all required fields
- Show success notification with doctor ID
- Refresh doctor list after creation
- Display error message if email already exists

---

### 3. Assign Doctor to Patient

**Endpoint:** `PUT /admin/patients/{patientId}/assign-doctor/{doctorId}`

**Authentication:** Required (JWT token)

**Role Requirements:** ADMIN only

**Path Parameters:**

- `patientId`: Long (required) - Patient ID to assign doctor to
- `doctorId`: Long (required) - Doctor ID to assign

**Request Body:** None

**Response (200 OK):**

```json
{
  "message": "Doctor assigned to patient successfully",
  "patientId": 1,
  "doctorId": 2
}
```

**Error Response (404 Not Found):**

```json
{}
```

**Error Response (403 Forbidden):**

```json
{}
```

**Side Effect:**

- Automatically creates notification for patient:
  - Title: "Doctor Assigned"
  - Message: "You have been assigned to Dr. [FirstName] [LastName]"

**Expected Frontend Behavior:**

- Display list of patients and available doctors
- Allow admin to select patient-doctor pair
- Show confirmation dialog before assignment
- Display success notification
- Refresh patient-doctor assignments list
- Handle 404 error if patient or doctor doesn't exist

---

## Doctor Endpoints

### 1. Get Assigned Patients

**Endpoint:** `GET /doctor/patients`

**Authentication:** Required (JWT token)

**Role Requirements:** DOCTOR only

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  {
    "id": 3,
    "firstName": "Mary",
    "lastName": "Johnson",
    "email": "mary@example.com"
  }
]
```

**Error Response (404 Not Found):** User is not a doctor

**Expected Frontend Behavior:**

- Display list of patients assigned to doctor
- Show patient basic information
- Allow doctor to click on patient to view details
- Show empty state if no patients assigned
- Refresh list periodically or on demand

---

### 2. Get Pending MRI Analyses

**Endpoint:** `GET /doctor/mri/pending`

**Authentication:** Required (JWT token)

**Role Requirements:** DOCTOR only

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "prediction": null,
    "confidence": null,
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "prediction": null,
    "confidence": null,
    "status": "PENDING",
    "createdAt": "2024-01-14T14:15:00"
  }
]
```

**Status Enum Values:** PENDING, ANALYZED, REVIEWED

**Expected Frontend Behavior:**

- Display list of pending MRI analyses
- Sort by creation date (newest first)
- Show upload time for each MRI
- Allow doctor to click on MRI to analyze
- Show count of pending analyses in UI
- Auto-refresh list periodically

---

### 3. Analyze MRI

**Endpoint:** `POST /doctor/mri/{id}/analyze`

**Authentication:** Required (JWT token)

**Role Requirements:** DOCTOR only

**Path Parameters:**

- `id`: Long (required) - MRI Analysis ID

**Request Body:** None

**Response (200 OK):**

```json
{
  "analysisId": 1,
  "prediction": "Positive",
  "confidence": 0.95,
  "probability": 0.9523,
  "status": "ANALYZED",
  "message": "MRI analysis completed successfully"
}
```

**Predictions:** Depends on ML model (typically "Positive" or "Negative" for tumor detection)

**Confidence:** Decimal 0.0-1.0 (0% to 100%)

**Probability:** More detailed probability value

**Error Response (400 Bad Request):**

```json
{
  "analysisId": 1,
  "prediction": null,
  "confidence": null,
  "probability": null,
  "status": "ANALYZED",
  "message": "MRI is already analyzed or reviewed"
}
```

**Error Response (403 Forbidden):**

```json
{
  "analysisId": null,
  "prediction": null,
  "confidence": null,
  "probability": null,
  "status": null,
  "message": "This MRI does not belong to your patient"
}
```

**Error Response (404 Not Found):**

```json
{
  "analysisId": null,
  "prediction": null,
  "confidence": null,
  "probability": null,
  "status": "PENDING",
  "message": "MRI analysis not found"
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "analysisId": 1,
  "prediction": null,
  "confidence": null,
  "probability": null,
  "status": "PENDING",
  "message": "FastAPI server is unavailable: ..."
}
```

**Backend Process:**

1. Validates doctor is authorized for patient
2. Verifies MRI status is PENDING
3. Reads image file from disk (uploads folder)
4. Sends to FastAPI ML model at `http://localhost:8000/predict`
5. Receives prediction, confidence, probability, and gradcam image
6. Updates MRI status to ANALYZED
7. Stores ML model results in database
8. Creates notification for patient

**Expected Frontend Behavior:**

- Show loading indicator during analysis
- Disable analyze button while processing
- Show confirmation dialog
- Display analysis results (prediction, confidence)
- Show gradcam visualization if provided
- Allow doctor to proceed to review step
- Show error message if analysis fails
- Allow retry if FastAPI server is unavailable

---

### 4. Review MRI

**Endpoint:** `PUT /doctor/mri/{id}/review`

**Authentication:** Required (JWT token)

**Role Requirements:** DOCTOR only

**Path Parameters:**

- `id`: Long (required) - MRI Analysis ID

**Request Body:**

```json
{
  "doctorNotes": "Patient shows signs of tumor in left hemisphere. Recommend follow-up MRI in 3 months."
}
```

**Request Validation:**

- `doctorNotes`: Optional string, free-form clinical notes

**Response (200 OK):**

```json
{
  "analysisId": 1,
  "status": "REVIEWED",
  "message": "MRI review completed successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "analysisId": 1,
  "status": "ANALYZED",
  "message": "MRI must be analyzed before review"
}
```

**Error Response (403 Forbidden):**

```json
{
  "analysisId": null,
  "status": null,
  "message": "This MRI does not belong to your patient"
}
```

**Error Response (404 Not Found):**

```json
{
  "analysisId": null,
  "status": null,
  "message": "MRI analysis not found"
}
```

**Backend Process:**

1. Validates doctor is authorized for patient
2. Verifies MRI status is ANALYZED
3. Updates status to REVIEWED
4. Stores doctor notes
5. Appends formatted entry to patient's medical history
6. Creates notification for patient

**Medical History Entry Format:**

```
[YYYY-MM-DD HH:mm]
MRI reviewed by Dr. FirstName LastName.
Prediction: [Prediction]
Confidence: XX.X%
Notes: [Doctor Notes]
```

**Expected Frontend Behavior:**

- Only enable review after analysis completes
- Provide text area for doctor notes
- Show MRI analysis results above notes field
- Display confirmation dialog
- Show success notification
- Redirect to patient view or next pending MRI
- Allow editing notes before submission

---

## Patient Endpoints

### 1. Get Assigned Doctor

**Endpoint:** `GET /patient/my-doctor`

**Authentication:** Required (JWT token)

**Role Requirements:** PATIENT only

**Request Body:** None

**Response (200 OK):**

```json
{
  "id": 2,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@hospital.com",
  "licenseNumber": "LIC-2024-001"
}
```

**Error Response (404 Not Found):**

- No doctor assigned to patient
- User is not a patient

**Expected Frontend Behavior:**

- Display assigned doctor information
- Show error message if no doctor assigned
- Provide button to request doctor assignment
- Allow patient to contact doctor

---

### 2. Upload MRI Image

**Endpoint:** `POST /patient/mri/upload`

**Authentication:** Required (JWT token)

**Role Requirements:** PATIENT only

**Content Type:** `multipart/form-data`

**Form Parameters:**

- `image`: File (required) - MRI image file
  - Accepted formats: Any image format (jpg, png, etc.)
  - Size limit: Browser dependent
  - Recommendation: < 50MB for practical use

**Request Example:**

```
POST /patient/mri/upload HTTP/1.1
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="image"; filename="mri_scan.jpg"
Content-Type: image/jpeg

[binary image data]
------FormBoundary--
```

**Response (201 Created):**

```json
{
  "message": "MRI image uploaded successfully",
  "analysisId": 1,
  "status": "PENDING"
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "No doctor assigned to this patient"
}
```

**Error Response (401 Unauthorized):** User is not a patient

**Error Response (500 Internal Server Error):**

```json
{
  "message": "Failed to upload MRI image: [error details]"
}
```

**Backend Process:**

1. Validates patient has assigned doctor
2. Creates uploads directory if needed
3. Generates unique filename: `{UUID}_{original_filename}`
4. Saves file to `uploads` folder
5. Creates MRI Analysis record with status PENDING
6. Stores file path in database

**File Storage:**

- Files stored in: `uploads/` directory (project root)
- Naming: `{UUID}_{original_filename}`
- Example: `a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5_mri_scan.jpg`

**Expected Frontend Behavior:**

- Provide file upload input (drag-drop recommended)
- Validate file is selected
- Show upload progress indicator
- Display error if no doctor assigned
- Show success notification with analysis ID
- Redirect to MRI tracking page after upload
- Display "Upload in progress" state

---

### 3. Get My MRI Analyses

**Endpoint:** `GET /patient/mri`

**Authentication:** Required (JWT token)

**Role Requirements:** PATIENT only

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "prediction": "Positive",
    "confidence": 0.95,
    "status": "ANALYZED",
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "prediction": null,
    "confidence": null,
    "status": "PENDING",
    "createdAt": "2024-01-14T14:15:00"
  }
]
```

**Expected Frontend Behavior:**

- Display list of all patient's MRI analyses
- Show status badge for each MRI
- Show upload date/time
- Show prediction and confidence if available
- Allow patient to view detailed history
- Show empty state if no MRIs uploaded
- Sort by creation date (newest first)

---

### 4. Get MRI History (Detailed)

**Endpoint:** `GET /patient/mri/history`

**Authentication:** Required (JWT token)

**Role Requirements:** PATIENT only

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "prediction": "Positive",
    "confidence": 0.95,
    "probability": 0.9523,
    "status": "REVIEWED",
    "doctorNotes": "Patient shows signs of tumor in left hemisphere. Recommend follow-up MRI in 3 months.",
    "gradcamImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "createdAt": "2024-01-15T10:30:00",
    "doctorName": "Dr. Jane Smith"
  }
]
```

**Ordered by:** Newest first

**GradCAM Image:** Base64 encoded image showing model attention regions

**Expected Frontend Behavior:**

- Display detailed MRI history
- Show all analysis information
- Display GradCAM visualization if available
- Show doctor notes if MRI is reviewed
- Show doctor name who performed review
- Allow patient to download PDF report
- Show status progression timeline

---

### 5. Export MRI as PDF

**Endpoint:** `GET /patient/mri/{id}/pdf`

**Authentication:** Required (JWT token)

**Role Requirements:** PATIENT only

**Path Parameters:**

- `id`: Long (required) - MRI Analysis ID

**Request Body:** None

**Response (200 OK):** PDF file

**Response Headers:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="mri-analysis-{id}.pdf"
Content-Length: [file size in bytes]
```

**Error Response (403 Forbidden):** MRI doesn't belong to patient

**Error Response (404 Not Found):** MRI not found

**PDF Content Sections:**

1. **Title:** "Brain Tumor MRI Analysis Report"
2. **Patient Information**
   - Name
   - Email
3. **MRI Analysis Results**
   - Prediction (tumor/no tumor)
   - Confidence (percentage)
   - Probability (decimal)
   - Status
   - Analysis Date
4. **Doctor Information** (if reviewed)
   - Doctor Name
   - Doctor License Number
   - Doctor Email
   - Doctor Notes
5. **GradCAM Image** (if available)
6. **Footer:** "Generated by Medical MRI Analysis System"

**Expected Frontend Behavior:**

- Show "Download PDF" button on MRI detail page
- Trigger file download on click
- Show loading indicator while generating PDF
- Handle download completion
- Show error message if PDF generation fails
- Suggest patient save PDF for records

---

## Notification Endpoints

### 1. Get User Notifications

**Endpoint:** `GET /notifications`

**Authentication:** Required (JWT token)

**Role Requirements:** All authenticated users

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "title": "Doctor Assigned",
    "message": "You have been assigned to Dr. Jane Smith",
    "isRead": true,
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "title": "MRI Analysis Completed",
    "message": "Your MRI analysis is complete. Result: Positive",
    "isRead": false,
    "createdAt": "2024-01-15T14:20:00"
  }
]
```

**Ordered by:** Newest first

**Expected Frontend Behavior:**

- Display notification list
- Show unread count in UI (badge)
- Sort by date (newest first)
- Show read/unread status
- Allow marking as read
- Show empty state if no notifications
- Auto-refresh notifications periodically
- Show toast notification for new notifications (real-time)

---

### 2. Mark Notification as Read

**Endpoint:** `PUT /notifications/{id}/read`

**Authentication:** Required (JWT token)

**Role Requirements:** All authenticated users

**Path Parameters:**

- `id`: Long (required) - Notification ID

**Request Body:** None

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "Doctor Assigned",
  "message": "You have been assigned to Dr. Jane Smith",
  "isRead": true,
  "createdAt": "2024-01-15T10:30:00"
}
```

**Error Response (403 Forbidden):** Notification doesn't belong to user

**Error Response (404 Not Found):** Notification not found

**Expected Frontend Behavior:**

- Mark notification as read when user clicks it
- Update UI to remove read badge
- Update notification list
- Call this endpoint when notification is viewed
- Handle bulk mark as read if UI supports it

---

## Support Ticket Endpoints

### 1. Create Support Ticket

**Endpoint:** `POST /support/tickets`

**Authentication:** Required (JWT token)

**Role Requirements:** All authenticated users

**Request Body:**

```json
{
  "subject": "Issue with MRI upload",
  "message": "I'm unable to upload my MRI images. Getting an error message."
}
```

**Request Validation:**

- `subject`: Required, string
- `message`: Required, string

**Response (201 Created):**

```json
{
  "id": 1,
  "subject": "Issue with MRI upload",
  "status": "OPEN",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Backend Process:**

1. Creates support ticket with status OPEN
2. Creates initial message from user
3. Stores both ticket and first message in database

**Expected Frontend Behavior:**

- Show support form with subject and message fields
- Validate both fields required
- Show success notification
- Redirect to ticket detail or tickets list
- Store ticket ID for reference

---

### 2. Get User's Support Tickets

**Endpoint:** `GET /support/tickets`

**Authentication:** Required (JWT token)

**Role Requirements:** All authenticated users

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "subject": "Issue with MRI upload",
    "status": "OPEN",
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "subject": "Account verification question",
    "status": "CLOSED",
    "createdAt": "2024-01-10T15:45:00"
  }
]
```

**Ordered by:** Newest first

**Expected Frontend Behavior:**

- Display list of user's support tickets
- Show status badge (OPEN, CLOSED)
- Show creation date
- Allow user to click to view details
- Show count of open tickets
- Filter by status if desired

---

### 3. Get Support Ticket Messages

**Endpoint:** `GET /support/tickets/{id}/messages`

**Authentication:** Required (JWT token)

**Role Requirements:** All authenticated users (owner of ticket only)

**Path Parameters:**

- `id`: Long (required) - Ticket ID

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "senderRole": "PATIENT",
    "message": "I'm unable to upload my MRI images. Getting an error message.",
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "senderRole": "ADMIN",
    "message": "Thank you for contacting support. We'll look into this issue.",
    "createdAt": "2024-01-15T11:00:00"
  },
  {
    "senderRole": "PATIENT",
    "message": "Thank you for your response.",
    "createdAt": "2024-01-15T11:30:00"
  }
]
```

**Ordered by:** Oldest first (chronological order)

**Sender Roles:** PATIENT, DOCTOR, ADMIN

**Error Response (403 Forbidden):** Ticket doesn't belong to authenticated user

**Error Response (404 Not Found):** Ticket not found

**Expected Frontend Behavior:**

- Display messages in chronological order
- Show message sender role
- Show timestamp for each message
- Style messages differently based on sender
- Allow user to scroll through conversation history
- Show empty state if no messages

---

### 4. Add Message to Support Ticket

**Endpoint:** `POST /support/tickets/{id}/messages`

**Authentication:** Required (JWT token)

**Role Requirements:** All authenticated users (owner of ticket only)

**Path Parameters:**

- `id`: Long (required) - Ticket ID

**Request Body:**

```json
{
  "message": "Thank you for your response. I'll try that solution."
}
```

**Request Validation:**

- `message`: Required, string

**Response (201 Created):**

```json
{
  "senderRole": "PATIENT",
  "message": "Thank you for your response. I'll try that solution.",
  "createdAt": "2024-01-15T12:00:00"
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "Cannot reply to closed ticket"
}
```

**Error Response (403 Forbidden):** Ticket doesn't belong to user

**Error Response (404 Not Found):** Ticket not found

**Restrictions:**

- Cannot add message to CLOSED ticket
- User's role is automatically determined from authentication

**Expected Frontend Behavior:**

- Show message input field
- Validate message is not empty
- Disable input if ticket is closed
- Show loading indicator while sending
- Append message to list on success
- Show error message if cannot reply
- Clear input field after successful submission

---

## Admin Support Endpoints

### 1. Get All Support Tickets (Admin View)

**Endpoint:** `GET /admin/support/tickets`

**Authentication:** Required (JWT token)

**Role Requirements:** ADMIN only

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "subject": "Issue with MRI upload",
    "status": "OPEN",
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "subject": "Account verification question",
    "status": "OPEN",
    "createdAt": "2024-01-15T09:15:00"
  },
  {
    "id": 3,
    "subject": "Feature request",
    "status": "CLOSED",
    "createdAt": "2024-01-14T16:45:00"
  }
]
```

**Ordered by:** Newest first

**Error Response (403 Forbidden):** User is not ADMIN

**Expected Frontend Behavior:**

- Only accessible to admin users
- Display all tickets (not just user's)
- Show count of open tickets
- Allow admin to filter by status
- Allow admin to search by subject
- Show ticket ID for reference

---

### 2. Get Support Ticket Messages (Admin)

**Endpoint:** `GET /admin/support/tickets/{id}/messages`

**Authentication:** Required (JWT token)

**Role Requirements:** ADMIN only

**Path Parameters:**

- `id`: Long (required) - Ticket ID

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "senderRole": "PATIENT",
    "message": "I'm unable to upload my MRI images.",
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "senderRole": "ADMIN",
    "message": "We're looking into this issue.",
    "createdAt": "2024-01-15T11:00:00"
  }
]
```

**Ordered by:** Oldest first

**Error Response (403 Forbidden):** User is not ADMIN

**Error Response (404 Not Found):** Ticket not found

**Expected Frontend Behavior:**

- Display conversation thread
- Show all sender roles
- Allow admin to view any ticket

---

### 3. Add Reply to Support Ticket (Admin)

**Endpoint:** `POST /admin/support/tickets/{id}/messages`

**Authentication:** Required (JWT token)

**Role Requirements:** ADMIN only

**Path Parameters:**

- `id`: Long (required) - Ticket ID

**Request Body:**

```json
{
  "message": "We've identified the issue. Please try uploading from a different browser."
}
```

**Request Validation:**

- `message`: Required, string

**Response (201 Created):**

```json
{
  "senderRole": "ADMIN",
  "message": "We've identified the issue. Please try uploading from a different browser.",
  "createdAt": "2024-01-15T11:30:00"
}
```

**Error Response (400 Bad Request):** Ticket is CLOSED

**Error Response (403 Forbidden):** User is not ADMIN

**Error Response (404 Not Found):** Ticket not found

**Note:**

- Admin's message automatically has sender role ADMIN
- Cannot reply to closed ticket

**Expected Frontend Behavior:**

- Show admin reply form in ticket detail
- Validate message not empty
- Show loading indicator
- Append admin reply to messages
- Disable form if ticket closed

---

### 4. Close Support Ticket

**Endpoint:** `PUT /admin/support/tickets/{id}/close`

**Authentication:** Required (JWT token)

**Role Requirements:** ADMIN only

**Path Parameters:**

- `id`: Long (required) - Ticket ID

**Request Body:** None

**Response (200 OK):**

```json
{
  "id": 1,
  "subject": "Issue with MRI upload",
  "status": "CLOSED",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Error Response (403 Forbidden):** User is not ADMIN

**Error Response (404 Not Found):** Ticket not found

**Effect:**

- Ticket status changed from OPEN to CLOSED
- Users cannot add replies to closed ticket
- Admin can still view ticket

**Expected Frontend Behavior:**

- Show close button on admin ticket detail
- Show confirmation dialog before closing
- Display success notification
- Update ticket status in UI
- Disable reply input after closing

---

## Chatbot Endpoints

### 1. Ask Chatbot

**Endpoint:** `POST /chatbot/ask`

**Authentication:** Required (JWT token)

**Role Requirements:** All authenticated users

**Request Body:**

```json
{
  "message": "What are the symptoms of a brain tumor?"
}
```

**Request Validation:**

- `message`: Required, non-empty string

**Response (200 OK):**

```json
{
  "response": "Brain tumors can present with various symptoms including:\n\n1. Headaches - often worse in the morning\n2. Seizures\n3. Vision or hearing problems\n4. Balance and coordination issues\n\nIf you experience persistent symptoms, please consult a licensed medical professional for proper diagnosis."
}
```

**Error Response (401 Unauthorized):** User not authenticated

**Error Response (500 Internal Server Error):**

```json
{
  "response": "Failed to get response from AI service. Please try again later."
}
```

**Chatbot System Prompt:**

The chatbot is configured with a medical information assistant system prompt that:

- Provides informational and educational content about brain tumors, MRI scans, and neurology
- Helps users understand medical procedures and health conditions
- Offers general wellness and healthcare support information
- Directs users to licensed medical professionals for diagnosis and treatment
- **NEVER provides definitive diagnoses**
- **NEVER prescribes medications or treatments**
- **NEVER provides emergency medical advice**
- Recommends consulting licensed doctors for serious symptoms
- Keeps answers concise, helpful, and beginner-friendly
- Redirects unrelated topics to healthcare information

**Backend Integration:**

- Uses Google Generative AI (Gemini 2.5 Flash model)
- API Key configured in `application.properties`
- Calls `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

**Expected Frontend Behavior:**

- Display chat interface
- Show loading indicator while waiting for response
- Display chatbot response in message bubble
- Allow user to ask follow-up questions
- Show disclaimer about medical information
- Provide link to emergency services if needed
- Show error message if service unavailable
- Allow user to copy chatbot response

---

## User Endpoints

### 1. Create User (Generic)

**Endpoint:** `POST /users`

**Authentication:** Not required (likely internal use only)

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "0712345678",
  "role": "PATIENT"
}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "PATIENT",
  "phoneNumber": "0712345678",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Note:** This endpoint is generic and not role-specific. Prefer using `/auth/register` for patient registration or `/admin/doctors` for doctor creation.

**Expected Frontend Behavior:**

- Generally not recommended for frontend use
- Use specific registration endpoints instead

---

### 2. Get All Users

**Endpoint:** `GET /users`

**Authentication:** Not required (likely internal use only)

**Request Body:** None

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "PATIENT",
    "phoneNumber": "0712345678",
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

**Note:** This endpoint returns all users. May have security implications if exposed.

**Expected Frontend Behavior:**

- Generally not recommended for frontend use
- If implemented, should be restricted to admin only

---

## Test Endpoints

### 1. Backend Health Check

**Endpoint:** `GET /test`

**Authentication:** Not required (public)

**Request Body:** None

**Response (200 OK):**

```
Backend works!
```

**Expected Frontend Behavior:**

- Call on app startup to verify backend connectivity
- Show loading state until response received
- Show error message if backend unavailable
- Retry with exponential backoff if connection fails

---

## Data Models

### Role Enum

```
PATIENT
DOCTOR
ADMIN
```

### MriStatus Enum

```
PENDING      - MRI uploaded, awaiting analysis
ANALYZED     - ML model has analyzed MRI, awaiting doctor review
REVIEWED     - Doctor has reviewed analysis and added notes
```

### SupportTicketStatus Enum

```
OPEN         - Ticket can receive messages
CLOSED       - Ticket cannot receive new messages
```

### BiologicalSex Enum

```
MALE
FEMALE
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning | Common Causes |
|------------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data, validation errors, missing required fields |
| 401 | Unauthorized | Invalid credentials, expired/missing token |
| 403 | Forbidden | User lacks required role or permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Setup code locked after 3 failed attempts |
| 500 | Internal Server Error | Backend error, external service unavailable |

### Error Response Format

Most error responses return a message field:

```json
{
  "message": "Error description"
}
```

Some responses may include additional fields:

```json
{
  "message": "MRI is already analyzed or reviewed",
  "status": 400
}
```

### Common Error Messages

| Message | Cause | Solution |
|---------|-------|----------|
| "Email already exists" | User tried to register with existing email | Use different email or login instead |
| "Invalid email or password" | Login credentials incorrect | Verify credentials and try again |
| "Invalid setup code" | Admin setup code incorrect | Verify code and try again |
| "Setup code is locked due to too many failed attempts" | 3 failed setup code attempts | Wait 10 minutes before retrying |
| "No doctor assigned to this patient" | Patient tried action requiring assigned doctor | Wait for admin to assign doctor |
| "This MRI does not belong to your patient" | Doctor tried to access patient's MRI | Verify patient assignment |
| "MRI is already analyzed or reviewed" | Doctor tried to analyze already analyzed MRI | Cannot re-analyze |
| "Cannot reply to closed ticket" | User tried to reply to closed support ticket | Open new ticket or contact admin |

### Token Expiration

When JWT token expires:

1. Backend returns 401 Unauthorized
2. Frontend should:
   - Clear stored token
   - Clear user data
   - Redirect to login page
   - Show "Session expired" message
3. User must log in again

**Note:** Token expiration is 24 hours. Implement automatic logout at token expiration.

---

## CORS Configuration

### Allowed Origins

```
http://localhost:8081
```

### Allowed Methods

All HTTP methods:

```
GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
```

### Allowed Headers

All headers:

```
*
```

### Allow Credentials

```
true
```

### Frontend Configuration

When making requests from frontend at `http://localhost:8081`:

```javascript
fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
```

### CORS Preflight Requests

Browser automatically sends OPTIONS request before actual request. Backend handles this automatically.

---

## Implementation Notes for Frontend Developers

### 1. Token Storage

Store JWT token securely:

```javascript
// Option 1: localStorage (simpler but less secure)
localStorage.setItem('token', response.token);

// Option 2: sessionStorage (clears on tab close)
sessionStorage.setItem('token', response.token);

// Option 3: Secure HTTP-only cookie (recommended for production)
// Set by backend in Set-Cookie header
```

### 2. Authorization Header

Include token in all authenticated requests:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### 3. Error Handling Pattern

```javascript
try {
  const response = await fetch(url, options);
  
  if (response.status === 401) {
    // Token expired or invalid
    clearAuth();
    redirectToLogin();
    return;
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  
  return await response.json();
} catch (error) {
  console.error('API error:', error);
  // Show error to user
}
```

### 4. Multipart File Upload

```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('/patient/mri/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type, let browser set it with boundary
  },
  body: formData
});
```

### 5. Real-time Features (Future)

Current implementation doesn't include WebSocket. Implement polling for:

- New notifications
- Support ticket replies
- MRI analysis completion

Suggested polling intervals:
- Notifications: 30 seconds
- Support messages: 10 seconds
- MRI status: 5 seconds

### 6. Recommended State Management

Store in frontend state management (Redux, Vuex, Zustand):

```javascript
{
  auth: {
    token: string,
    user: {
      id: number,
      firstName: string,
      lastName: string,
      email: string,
      role: string,
      phoneNumber: string
    },
    isAuthenticated: boolean
  },
  notifications: [],
  supportTickets: [],
  mriAnalyses: []
}
```

### 7. Role-Based Navigation

```javascript
const navigationByRole = {
  PATIENT: [
    'Dashboard',
    'My Doctor',
    'Upload MRI',
    'MRI History',
    'Support Tickets',
    'Chatbot'
  ],
  DOCTOR: [
    'Dashboard',
    'My Patients',
    'Pending MRIs',
    'Support Tickets',
    'Chatbot'
  ],
  ADMIN: [
    'Dashboard',
    'Manage Doctors',
    'Assign Doctors',
    'Support Tickets',
    'System Settings'
  ]
};
```

---

## Integration Checklist for Frontend

- [ ] Implement user registration flow
- [ ] Implement login flow with token storage
- [ ] Set up JWT token in request headers
- [ ] Implement token refresh/logout on expiration
- [ ] Create role-based navigation
- [ ] Implement patient MRI upload functionality
- [ ] Implement doctor MRI analysis workflow
- [ ] Create patient notifications display
- [ ] Implement support ticket system
- [ ] Add chatbot integration
- [ ] Create admin dashboard for doctor management
- [ ] Implement PDF export for MRI reports
- [ ] Add CORS configuration to requests
- [ ] Implement error handling for all endpoints
- [ ] Add loading states to UI
- [ ] Test all endpoints with different user roles
- [ ] Set up automatic token expiration handling
- [ ] Implement offline error messages

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial documentation of all endpoints |

---

**Document Last Updated:** 2024-01-15

**Note:** This guide documents the backend exactly as implemented. No endpoints have been invented or modified for frontend convenience. All information is based on the current Spring Boot backend implementation.
