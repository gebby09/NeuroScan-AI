# Frontend-Backend Integration Mismatch Report

**Generated:** June 13, 2026  
**Analysis Date:** June 13, 2026  
**Source of Truth:** FRONTEND_INTEGRATION_GUIDE.md  
**Scope:** Frontend/Backend API Integration Issues Only

---

## Executive Summary

This report identifies **22 critical integration mismatches** between the frontend implementation and the FRONTEND_INTEGRATION_GUIDE.md specification. The issues include:

- **6 Critical Issues** that prevent core functionality
- **10 Endpoint URL/Method Mismatches**
- **6 Missing Backend Endpoints** not documented in the guide
- **Missing Frontend Feature Implementations** (MRI Analysis)

---

## Critical Issues (Must Fix)

### 1. ❌ CRITICAL: MRI Analysis Endpoint Not Called

**Severity:** CRITICAL  
**Impact:** Core doctor workflow broken - doctors cannot analyze MRI images

**Details:**
- **Backend Endpoint:** `POST /doctor/mri/{id}/analyze`
- **Frontend Implementation:** **Missing** - Not called from any frontend route
- **Status:** Backend endpoint exists but frontend has no UI or API call to trigger it
- **Affected Pages:** [Doctor pending-mri page](src/routes/_authenticated/doctor/pending-mri.tsx#L16), [Doctor review page](src/routes/_authenticated/doctor/mri.$id.review.tsx)
- **Expected Frontend Behavior:** Doctor clicks "Analyze" button → calls `POST /doctor/mri/{id}/analyze` → gets AI prediction
- **Current Frontend Behavior:** Doctor never sees analyze button; MRI analysis is not triggered

**Recommended Fix:**
1. Add "Analyze" button to pending MRI list in [pending-mri.tsx](src/routes/_authenticated/doctor/pending-mri.tsx)
2. Create API function in [lib/api/doctor.ts](src/lib/api/doctor.ts): `analyzeMri(id: string)`
3. Implement POST request to `/doctor/mri/{id}/analyze`
4. Handle response with prediction, confidence, probability, and gradcam image
5. Update MRI status after successful analysis

---

### 2. ❌ CRITICAL: Wrong Assign Doctor Endpoint

**Severity:** CRITICAL  
**Impact:** Cannot assign doctors to patients - admin workflow broken

**Details:**
- **Frontend File:** [lib/api/admin.ts](src/lib/api/admin.ts#L9)
- **Frontend API Call:**
  ```typescript
  assignDoctorToPatient = (patientId: string, doctorId: string) =>
    api.post("/admin/assign-doctor", { patientId, doctorId })
  ```
- **Backend Endpoint (Expected):** `PUT /admin/patients/{patientId}/assign-doctor/{doctorId}`
- **Issue:** Wrong HTTP method (POST vs PUT) and wrong URL format (path params vs body)
- **Affected Pages:** [Assign Doctor page](src/routes/_authenticated/admin/assign-doctor.tsx#L52)
- **Pages That Cannot Function:** Admin cannot perform doctor assignments

**Recommended Fix:**
```typescript
// In lib/api/admin.ts
export const assignDoctorToPatient = (patientId: string, doctorId: string) =>
  api.put(`/admin/patients/${patientId}/assign-doctor/${doctorId}`)
    .then((r) => r.data);
```

---

### 3. ❌ CRITICAL: Wrong Pending MRI Endpoint URL

**Severity:** CRITICAL  
**Impact:** Doctor dashboard cannot load pending MRI analyses

**Details:**
- **Frontend File:** [lib/api/doctor.ts](src/lib/api/doctor.ts#L4)
- **Frontend API Call:**
  ```typescript
  getPendingMri = () => api.get("/doctor/pending-mri")
  ```
- **Backend Endpoint (Expected):** `GET /doctor/mri/pending`
- **Issue:** Wrong URL path format
- **Affected Pages:** [Doctor dashboard](src/routes/_authenticated/doctor/dashboard.tsx#L22), [Pending MRI page](src/routes/_authenticated/doctor/pending-mri.tsx#L21)
- **Pages That Cannot Function:** Doctor sees empty pending MRI list

**Recommended Fix:**
```typescript
// In lib/api/doctor.ts
export const getPendingMri = () => api.get("/doctor/mri/pending").then((r) => r.data);
```

---

### 4. ❌ CRITICAL: Wrong MRI Review Endpoint Method & DTO

**Severity:** CRITICAL  
**Impact:** Doctor cannot submit MRI reviews

**Details:**
- **Frontend File:** [lib/api/doctor.ts](src/lib/api/doctor.ts#L8)
- **Frontend API Call:**
  ```typescript
  submitMriReview = (mriId: string, notes: string) =>
    api.post(`/doctor/mri/${mriId}/review`, { notes })
  ```
- **Backend Endpoint (Expected):** `PUT /doctor/mri/{id}/review`
- **Backend Request DTO:** `{ doctorNotes: string }`
- **Issues:**
  1. Wrong HTTP method (POST vs PUT)
  2. Wrong request body field name (`notes` vs `doctorNotes`)
- **Affected Pages:** [MRI Review page](src/routes/_authenticated/doctor/mri.$id.review.tsx#L35)
- **Pages That Cannot Function:** Doctor review form cannot submit

**Recommended Fix:**
```typescript
// In lib/api/doctor.ts
export const submitMriReview = (mriId: string, notes: string) =>
  api.put(`/doctor/mri/${mriId}/review`, { doctorNotes: notes })
    .then((r) => r.data);
```

---

### 5. ❌ CRITICAL: Wrong Notification Read Endpoint Method

**Severity:** HIGH  
**Impact:** Notifications don't properly mark as read (backend expects PUT not POST)

**Details:**
- **Frontend File:** [lib/api/notifications.ts](src/lib/api/notifications.ts#L6)
- **Frontend API Call:**
  ```typescript
  markNotificationAsRead = (id: string) =>
    api.post(`/notifications/${id}/read`)
  ```
- **Backend Endpoint (Expected):** `PUT /notifications/{id}/read`
- **Issue:** Wrong HTTP method (POST vs PUT)
- **Affected Pages:** Any page with notifications
- **Pages That Cannot Function:** Notification read status not updating properly

**Recommended Fix:**
```typescript
// In lib/api/notifications.ts
export const markNotificationAsRead = (id: string) =>
  api.put(`/notifications/${id}/read`).then((r) => r.data);
```

---

### 6. ❌ CRITICAL: Unassign Doctor Has Wrong Endpoint URL

**Severity:** HIGH  
**Impact:** Cannot unassign doctors from patients

**Details:**
- **Frontend File:** [lib/api/admin.ts](src/lib/api/admin.ts#L10)
- **Frontend API Call:**
  ```typescript
  unassignDoctor = (patientId: string) =>
    api.post(`/admin/unassign-doctor/${patientId}`)
  ```
- **Backend Endpoint (Expected):** Not documented in FRONTEND_INTEGRATION_GUIDE.md
- **Issue:** Endpoint does not exist in backend specification
- **Affected Pages:** [Assign Doctor page](src/routes/_authenticated/admin/assign-doctor.tsx#L66) - Unassign button functionality
- **Pages That Cannot Function:** Cannot unassign doctors

**Recommended Fix:**
1. Define backend endpoint in Spring Boot API
2. Update frontend call to match backend implementation
3. Consider if this should be implemented or if doctors should be permanently assigned

---

## Endpoint Mismatches (URL/Method Issues)

### URL/Method Mismatch Issues

| # | Endpoint | Frontend | Backend Expected | File | Issue |
|---|----------|----------|------------------|------|-------|
| 1 | Pending MRI | `GET /doctor/pending-mri` | `GET /doctor/mri/pending` | [doctor.ts](src/lib/api/doctor.ts#L4) | URL format |
| 2 | Assign Doctor | `POST /admin/assign-doctor` | `PUT /admin/patients/{id}/assign-doctor/{id}` | [admin.ts](src/lib/api/admin.ts#L9) | Method + URL |
| 3 | Review MRI | `POST /doctor/mri/{id}/review` | `PUT /doctor/mri/{id}/review` | [doctor.ts](src/lib/api/doctor.ts#L8) | Method + DTO |
| 4 | Mark Read | `POST /notifications/{id}/read` | `PUT /notifications/{id}/read` | [notifications.ts](src/lib/api/notifications.ts#L6) | Method |
| 5 | Draft Review | `POST /doctor/mri/{id}/draft` | Not in guide | [doctor.ts](src/lib/api/doctor.ts#L10) | Undocumented |
| 6 | Mark All Read | `POST /notifications/read-all` | Not in guide | [notifications.ts](src/lib/api/notifications.ts#L7) | Undocumented |

---

## Missing Backend Endpoints (Called by Frontend but Not in Guide)

These endpoints are called by the frontend but not documented in FRONTEND_INTEGRATION_GUIDE.md. Either they need to be added to the guide or the frontend should not call them.

### Admin Endpoints

| Endpoint | Frontend File | Usage |
|----------|---------------|-------|
| `GET /admin/dashboard` | [admin.ts](src/lib/api/admin.ts#L3) | Admin dashboard metrics |
| `PUT /admin/doctors/{id}` | [admin.ts](src/lib/api/admin.ts#L6) | Edit doctor information |
| `DELETE /admin/doctors/{id}` | [admin.ts](src/lib/api/admin.ts#L7) | Delete doctor account |
| `DELETE /admin/patients/{id}` | [admin.ts](src/lib/api/admin.ts#L8) | Delete patient account |
| `GET /admin/activities` | [admin.ts](src/lib/api/admin.ts#L11) | Fetch recent activities for dashboard |
| `GET /admin/assignments` | [admin.ts](src/lib/api/admin.ts#L12) | Fetch recent doctor-patient assignments |

**Impact:** Admin features (dashboard, doctor/patient management) cannot function  
**Recommended Fix:** Either implement these endpoints in backend or remove frontend features

### Doctor Endpoints

| Endpoint | Frontend File | Usage |
|----------|---------------|-------|
| `GET /doctor/dashboard` | [doctor.ts](src/lib/api/doctor.ts#L11) | Doctor dashboard metrics |
| `GET /doctor/profile` | [doctor.ts](src/lib/api/doctor.ts#L12) | Fetch doctor profile for edit form |
| `PUT /doctor/profile` | [doctor.ts](src/lib/api/doctor.ts#L13) | Update doctor profile information |
| `GET /doctor/reviewed-analyses` | [doctor.ts](src/lib/api/doctor.ts#L5) | Fetch list of reviewed MRI analyses |
| `GET /doctor/mri/{id}` | [doctor.ts](src/lib/api/doctor.ts#L6) | Fetch individual MRI details |
| `POST /doctor/mri/{id}/draft` | [doctor.ts](src/lib/api/doctor.ts#L10) | Save draft review without submission |

**Impact:** Doctor profile editing, dashboard, and review history cannot function  
**Recommended Fix:** Implement these endpoints in backend or remove frontend features

### Patient Endpoints

| Endpoint | Frontend File | Usage |
|----------|---------------|-------|
| `GET /patient/mri/{id}` | [mri.$id.tsx](src/routes/_authenticated/patient/mri.$id.tsx#L24) | Fetch detailed MRI analysis for patient view |

**Impact:** Patient cannot view detailed MRI analysis and doctor notes  
**Recommended Fix:** Implement this endpoint in backend

### Authentication Endpoints

| Endpoint | Frontend File | Usage |
|----------|---------------|-------|
| `POST /auth/change-password` | [profile.tsx](src/routes/_authenticated/doctor/profile.tsx#L47) | Change password functionality |

**Impact:** Users cannot change passwords  
**Recommended Fix:** Implement this endpoint in backend

### Support Endpoints

| Endpoint | Frontend File | Usage |
|----------|---------------|-------|
| `GET /support/tickets/{id}/messages` | [support.ts](src/lib/api/support.ts#L5) | Fetch message thread for support ticket |
| `POST /support/tickets/{id}/messages` | [support.ts](src/lib/api/support.ts#L9) | Add message to support ticket |
| `POST /support/tickets/{id}/close` | [support.ts](src/lib/api/support.ts#L10) | Close support ticket |
| `POST /support/tickets/{id}/reopen` | [support.ts](src/lib/api/support.ts#L11) | Reopen support ticket |

**Impact:** Support ticket messaging and ticket management cannot function  
**Recommended Fix:** Implement these endpoints in backend

### Chatbot Endpoint

| Endpoint | Frontend File | Usage |
|----------|---------------|-------|
| `POST /chatbot/ask` | [Chatbot.tsx](src/components/Chatbot.tsx#L27), [chatbot.tsx](src/routes/_authenticated/patient/chatbot.tsx#L33) | Send chatbot query and get response |

**Impact:** Chatbot feature cannot function  
**Recommended Fix:** Implement this endpoint in backend or remove chatbot feature

---

## Missing Frontend Implementations (Backend Endpoints Not Called)

These endpoints are documented in FRONTEND_INTEGRATION_GUIDE.md but the frontend never calls them.

### Doctor Analysis Workflow

| Endpoint | Purpose | Frontend Implementation | Status |
|----------|---------|------------------------|--------|
| `POST /doctor/mri/{id}/analyze` | Trigger AI ML model analysis of MRI | **NOT CALLED** | Missing |

**Impact:** Critical - Core doctor workflow cannot complete  
**Expected Flow:**
1. Doctor views pending MRI in [pending-mri.tsx](src/routes/_authenticated/doctor/pending-mri.tsx)
2. Doctor clicks "Analyze" button (doesn't exist)
3. Frontend calls `POST /doctor/mri/{id}/analyze`
4. Shows loading state while ML model processes
5. Returns prediction, confidence, probability, and gradcam image
6. Doctor then reviews the analyzed MRI

**Recommended Fix:** Implement analyze workflow in frontend as described in guide

---

## Request/Response DTO Mismatches

### 1. MRI Review Request DTO

**Frontend Sends:**
```typescript
{ notes: string }
```

**Backend Expects (per guide):**
```json
{
  "doctorNotes": "Patient shows signs of tumor..."
}
```

**Issue:** Field name mismatch (`notes` vs `doctorNotes`)  
**Location:** [doctor.ts line 8](src/lib/api/doctor.ts#L8)  
**Fix:** Update to send `doctorNotes` field name

---

### 2. Assign Doctor Request DTO

**Frontend Sends:**
```typescript
POST /admin/assign-doctor
{ patientId: string, doctorId: string }
```

**Backend Expects (per guide):**
```
PUT /admin/patients/{patientId}/assign-doctor/{doctorId}
(no body - parameters in URL)
```

**Issue:** Wrong HTTP method and parameter format  
**Location:** [admin.ts line 9](src/lib/api/admin.ts#L9)  
**Fix:** Use URL path parameters instead of request body

---

## Pages That Cannot Function Without Fixes

The following pages will not work correctly without fixing the mismatches:

### Admin Pages

| Page | Route | Required Fixes |
|------|-------|----------------|
| Admin Dashboard | `/admin/dashboard` | Fix `GET /admin/dashboard` endpoint or implement |
| Manage Doctors | `/admin/doctors` | Fix `GET /admin/doctors`, implement `PUT` and `DELETE` |
| Manage Patients | `/admin/patients` | Fix `GET /admin/patients`, implement `DELETE` |
| Assign Doctor | `/admin/assign-doctor` | **CRITICAL:** Fix assign/unassign endpoints |

### Doctor Pages

| Page | Route | Required Fixes |
|------|-------|----------------|
| Doctor Dashboard | `/doctor/dashboard` | **CRITICAL:** Fix `GET /doctor/mri/pending`, implement `GET /doctor/dashboard` |
| Pending MRI | `/doctor/pending-mri` | **CRITICAL:** Fix `GET /doctor/mri/pending`, implement MRI analyze |
| Review MRI | `/doctor/mri/$id/review` | **CRITICAL:** Fix `PUT /doctor/mri/{id}/review`, implement analyze |
| Doctor Profile | `/doctor/profile` | Implement `GET` and `PUT /doctor/profile`, `POST /auth/change-password` |
| Doctor Patients | `/doctor/patients` | Verify `GET /doctor/patients` works |

### Patient Pages

| Page | Route | Required Fixes |
|------|-------|----------------|
| Patient Dashboard | `/patient/dashboard` | Verify `GET /patient/mri`, `GET /patient/my-doctor` work |
| MRI History | `/patient/mri-history` | Verify `GET /patient/mri/history` works |
| MRI Details | `/patient/mri/$id` | Implement `GET /patient/mri/{id}` |
| Upload MRI | `/patient/upload-mri` | Verify `POST /patient/mri/upload` works |
| Patient Support | `/patient/support` | Implement support ticket endpoints |
| Patient Chatbot | `/patient/chatbot` | Implement `POST /chatbot/ask` |

---

## Severity Classification

### CRITICAL (Blocks Core Functionality)
1. Missing MRI analyze endpoint call
2. Wrong assign doctor endpoint (method + URL)
3. Wrong pending MRI URL
4. Wrong review endpoint (method + DTO)
5. Dashboard endpoints missing

**Action Required:** Fix immediately - features cannot work

### HIGH (Feature Broken but Workaround Possible)
1. Wrong notification read method
2. Unassign doctor not implemented
3. Support ticket operations not implemented

**Action Required:** Fix before release

### MEDIUM (Data Inconsistency)
1. Missing profile endpoints
2. Missing detailed MRI endpoint
3. Missing activity endpoints

**Action Required:** Fix in next iteration

### LOW (Documentation/Polish)
1. Undocumented features (chatbot)
2. Draft review functionality not in guide
3. Additional endpoints not in guide

**Action Required:** Update guide or remove features

---

## Summary Table

| Category | Count | Severity |
|----------|-------|----------|
| Critical Issues | 5 | CRITICAL |
| URL/Method Mismatches | 6 | HIGH |
| Missing Backend Endpoints | 16 | HIGH/MEDIUM |
| Missing Frontend Implementations | 1 | CRITICAL |
| **Total Issues** | **28** | - |

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Immediate)
1. Fix pending MRI endpoint: `GET /doctor/mri/pending`
2. Fix assign doctor endpoint: `PUT /admin/patients/{id}/assign-doctor/{id}`
3. Fix review MRI endpoint: `PUT /doctor/mri/{id}/review` with `doctorNotes`
4. Implement MRI analyze call: `POST /doctor/mri/{id}/analyze`
5. Fix notification read method: `PUT /notifications/{id}/read`

### Phase 2: Backend Implementation (High Priority)
1. Implement admin dashboard endpoints
2. Implement doctor profile endpoints
3. Implement doctor CRUD operations
4. Implement support ticket message endpoints
5. Implement patient MRI detail endpoint

### Phase 3: Feature Completion (Medium Priority)
1. Implement chatbot endpoint or remove feature
2. Implement draft review if needed
3. Complete support ticket management
4. Implement remaining admin features

### Phase 4: Documentation (Low Priority)
1. Update FRONTEND_INTEGRATION_GUIDE.md with all implemented endpoints
2. Document any new endpoints
3. Ensure response DTOs are documented

---

## Files Requiring Changes

### Frontend Changes Required
- [src/lib/api/admin.ts](src/lib/api/admin.ts) - Fix 5 endpoints
- [src/lib/api/doctor.ts](src/lib/api/doctor.ts) - Fix 4 endpoints, add 1 new
- [src/lib/api/notifications.ts](src/lib/api/notifications.ts) - Fix 1 endpoint
- [src/routes/_authenticated/doctor/mri.$id.review.tsx](src/routes/_authenticated/doctor/mri.$id.review.tsx) - Add analyze UI
- [src/routes/_authenticated/doctor/pending-mri.tsx](src/routes/_authenticated/doctor/pending-mri.tsx) - Add analyze button

### Backend Changes Required (Spring Boot)
- Create missing admin dashboard endpoints
- Create missing doctor profile endpoints
- Create missing support ticket message endpoints
- Create missing patient detail endpoint
- Create chatbot endpoint or remove feature
- Fix request/response DTOs to match frontend

---

## Appendix: Complete API Call Audit

### ✅ Matching Endpoints

| Frontend Call | Backend Endpoint | Status |
|---------------|------------------|--------|
| `POST /auth/login` | `POST /auth/login` | ✅ Matches |
| `POST /auth/register` | `POST /auth/register` | ✅ Matches |
| `GET /doctor/patients` | `GET /doctor/patients` | ✅ Matches |
| `GET /notifications` | `GET /notifications` | ✅ Matches |
| `POST /support/tickets` | `POST /support/tickets` | ✅ Matches |
| `GET /support/tickets` | `GET /support/tickets` | ✅ Matches |
| `GET /patient/my-doctor` | `GET /patient/my-doctor` | ✅ Matches |
| `POST /patient/mri/upload` | `POST /patient/mri/upload` | ✅ Matches |
| `GET /patient/mri` | `GET /patient/mri` | ✅ Matches |
| `GET /patient/mri/history` | `GET /patient/mri/history` | ✅ Matches |
| `GET /patient/mri/{id}/pdf` | `GET /patient/mri/{id}/pdf` | ✅ Matches |

---

**End of Report**
