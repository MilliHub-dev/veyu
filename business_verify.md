# Business Verification - Frontend Quick Start Guide

## 🎯 Quick Overview

**What Changed:**
- Removed Dojah third-party verification
- Added manual admin approval workflow
- New API endpoints for submitting and checking verification status

**Who Can Use:**
- Dealers (`user_type: 'dealer'`)
- Mechanics (`user_type: 'mechanic'`)

---

## 🚀 Quick Integration (5 Steps)

### Step 1: Check Status After Login

```javascript
// After successful login
const loginResponse = await login(email, password);

if (loginResponse.user_type === 'dealer' || loginResponse.user_type === 'mechanic') {
  const status = loginResponse.business_verification_status;
  // status can be: 'not_submitted', 'pending', 'verified', 'rejected'
  
  // Show appropriate UI based on status
  showVerificationBanner(status);
}
```

### Step 2: Create Verification Form

```jsx
// React Example
const VerificationForm = () => {
  const [formData, setFormData] = useState({
    business_type: userType === 'dealer' ? 'dealership' : 'mechanic',
    business_name: '',
    business_address: '',
    business_email: '',
    business_phone: '',
    cac_number: '',
    tin_number: ''
  });

  const [files, setFiles] = useState({
    cac_document: null,
    tin_document: null,
    proof_of_address: null,
    business_license: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
    // Add files
    Object.entries(files).forEach(([key, file]) => {
      if (file) formDataToSend.append(key, file);
    });
    
    try {
      const response = await fetch('https://dev.veyu.cc/api/v1/accounts/verify-business/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (result.error) {
        // Show validation errors
        setErrors(result.errors);
      } else {
        // Success!
        showSuccessMessage(result.message);
        // Redirect to dashboard or status page
      }
    } catch (error) {
      showErrorMessage('Submission failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields here */}
    </form>
  );
};
```

### Step 3: Display Status Badge

```jsx
const VerificationStatusBadge = ({ status }) => {
  const statusConfig = {
    not_submitted: {
      label: 'Not Submitted',
      color: 'gray',
      icon: '⚠️',
      action: 'Submit Verification'
    },
    pending: {
      label: 'Pending Review',
      color: 'orange',
      icon: '⏳',
      message: 'Your verification is being reviewed by our team'
    },
    verified: {
      label: 'Verified',
      color: 'green',
      icon: '✅',
      message: 'Your business is verified!'
    },
    rejected: {
      label: 'Rejected',
      color: 'red',
      icon: '❌',
      action: 'Resubmit Verification'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`badge badge-${config.color}`}>
      <span>{config.icon} {config.label}</span>
      {config.message && <p>{config.message}</p>}
      {config.action && <button>{config.action}</button>}
    </div>
  );
};
```

### Step 4: Check Status Anytime

```javascript
const checkVerificationStatus = async () => {
  const response = await fetch('https://dev.veyu.cc/api/v1/accounts/verify-business/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  return {
    status: data.status,
    statusDisplay: data.status_display,
    submissionDate: data.submission_date,
    rejectionReason: data.rejection_reason
  };
};
```

### Step 5: Handle Rejection

```jsx
const RejectionMessage = ({ reason }) => {
  return (
    <div className="rejection-alert">
      <h3>❌ Verification Rejected</h3>
      <p><strong>Reason:</strong> {reason}</p>
      <button onClick={handleResubmit}>
        Resubmit Verification
      </button>
    </div>
  );
};
```

---

## 📋 Required Form Fields

### Text Fields (Required)
```javascript
{
  business_type: 'dealership' | 'mechanic',  // Auto-set based on user type
  business_name: 'ABC Motors Limited',       // Official business name
  business_address: '123 Main St, Lagos',    // Full address
  business_email: 'info@abc.com',            // Business email
  business_phone: '+2348012345678'           // Phone with country code
}
```

### Text Fields (Optional)
```javascript
{
  cac_number: 'RC123456',        // CAC registration number
  tin_number: '12345678-0001'    // Tax ID number
}
```

### File Fields (Optional but Recommended)
```javascript
{
  cac_document: File,         // CAC certificate (PDF/JPG/PNG)
  tin_document: File,         // TIN certificate (PDF/JPG/PNG)
  proof_of_address: File,     // Utility bill or lease (PDF/JPG/PNG)
  business_license: File      // Business license (PDF/JPG/PNG)
}
```

---

## 🎨 CSS Styling Examples

```css
/* Status Badges */
.badge {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.badge-gray {
  background-color: #f3f4f6;
  color: #6b7280;
}

.badge-orange {
  background-color: #fef3c7;
  color: #d97706;
}

.badge-green {
  background-color: #d1fae5;
  color: #059669;
}

.badge-red {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Rejection Alert */
.rejection-alert {
  background-color: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.rejection-alert h3 {
  color: #dc2626;
  margin-bottom: 8px;
}

.rejection-alert button {
  background-color: #dc2626;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-top: 12px;
}
```

---

## 🔄 Status Flow Diagram

```
User Login
    ↓
Check business_verification_status
    ↓
┌───────────────────────────────────────┐
│                                       │
│  not_submitted  →  Show "Submit" CTA  │
│                                       │
│  pending  →  Show "Under Review" msg  │
│                                       │
│  verified  →  Show "Verified" badge   │
│                                       │
│  rejected  →  Show reason + Resubmit  │
│                                       │
└───────────────────────────────────────┘
```

---

## ⚠️ Error Handling

```javascript
const handleVerificationSubmit = async (formData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      switch (response.status) {
        case 400:
          // Validation errors
          showFieldErrors(data.errors);
          break;
        case 401:
          // Unauthorized - redirect to login
          redirectToLogin();
          break;
        case 404:
          // Profile not found
          showError('Business profile not found. Please contact support.');
          break;
        default:
          showError('An error occurred. Please try again.');
      }
      return;
    }
    
    // Success
    showSuccess(data.message);
    updateVerificationStatus('pending');
    
  } catch (error) {
    showError('Network error. Please check your connection.');
  }
};
```

---

## 📱 Mobile-Friendly File Upload

```jsx
const FileUploadInput = ({ label, name, onChange, accept = ".pdf,.jpg,.jpeg,.png" }) => {
  const [preview, setPreview] = useState(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      }
      
      onChange(name, file);
    }
  };
  
  return (
    <div className="file-upload">
      <label>{label}</label>
      <input 
        type="file" 
        accept={accept}
        onChange={handleFileChange}
      />
      {preview && <img src={preview} alt="Preview" className="preview" />}
    </div>
  );
};
```

---

## 🧪 Testing Checklist

- [ ] Form displays correctly for dealers
- [ ] Form displays correctly for mechanics
- [ ] All required fields validated
- [ ] File upload works (all formats)
- [ ] File size validation (5MB limit)
- [ ] Success message shows after submission
- [ ] Status badge updates after submission
- [ ] Rejection reason displays correctly
- [ ] Resubmit works after rejection
- [ ] Status persists after page refresh
- [ ] Mobile responsive design
- [ ] Error messages display properly

---

## 🔗 API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/accounts/verify-business/` | GET | Check status |
| `/api/v1/accounts/verify-business/` | POST | Submit verification |
| `/api/v1/accounts/login/` | POST | Login (includes status) |

---

## 📞 Need Help?

- **Full API Docs**: `docs/BUSINESS_VERIFICATION_API.md`
- **Swagger UI**: `https://dev.veyu.cc/swagger/`
- **Backend Team**: Contact for API issues
- **Test Accounts**: 
  - Dealer: `dealer@test.com` / `password123`
  - Mechanic: `mechanic@test.com` / `password123`

---

## ✅ Quick Wins

1. **Show status badge on dashboard** - 5 mins
2. **Add "Submit Verification" button** - 10 mins
3. **Create basic form** - 30 mins
4. **Add file uploads** - 20 mins
5. **Handle rejection messages** - 15 mins

**Total Time**: ~1.5 hours for basic implementation

---

**Ready to start?** Begin with Step 1 (checking status after login) and build from there! 🚀



# Business Verification API Documentation

## Overview
The Business Verification system allows dealers and mechanics to submit their business details for manual admin approval. This replaces the previous Dojah integration with a more controlled verification process.

## Base URL
```
https://dev.veyu.cc/api/v1/accounts/
```

## Authentication
All endpoints require authentication via:
- **Token Authentication**: `Authorization: Token <your_token>`
- **JWT Authentication**: `Authorization: Bearer <your_jwt_token>`

Only users with `user_type` of `dealer` or `mechanic` can access these endpoints.

---

## Endpoints

### 1. Check Verification Status

**GET** `/verify-business/`

Check the current business verification status for the authenticated user.

#### Request Headers
```http
Authorization: Bearer <your_token>
```

#### Response - Success (200 OK)

**Not Submitted:**
```json
{
  "status": "not_submitted",
  "status_display": "Not Submitted",
  "submission_date": null,
  "rejection_reason": null
}
```

**Pending Review:**
```json
{
  "status": "pending",
  "status_display": "Pending Review",
  "submission_date": "2025-10-20T14:30:00Z",
  "rejection_reason": null
}
```

**Verified:**
```json
{
  "status": "verified",
  "status_display": "Verified",
  "submission_date": "2025-10-20T14:30:00Z",
  "rejection_reason": null
}
```

**Rejected:**
```json
{
  "status": "rejected",
  "status_display": "Rejected",
  "submission_date": "2025-10-20T14:30:00Z",
  "rejection_reason": "Please provide a valid CAC certificate. The document submitted is not readable."
}
```

#### Response - Error (400 Bad Request)
```json
{
  "error": true,
  "message": "Only dealers and mechanics can submit business verification"
}
```

#### Response - Error (404 Not Found)
```json
{
  "error": true,
  "message": "Business profile not found"
}
```

---

### 2. Submit Business Verification

**POST** `/verify-business/`

Submit business verification details for admin review. If a submission already exists, it will be updated and status reset to `pending`.

#### Request Headers
```http
Authorization: Bearer <your_token>
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `business_type` | string | **Yes** | Either `"dealership"` or `"mechanic"` |
| `business_name` | string | **Yes** | Official registered business name |
| `business_address` | string | **Yes** | Full business address |
| `business_email` | string | **Yes** | Business contact email |
| `business_phone` | string | **Yes** | Business contact phone (format: +234...) |
| `cac_number` | string | No | Corporate Affairs Commission number (e.g., RC123456) |
| `tin_number` | string | No | Tax Identification Number (e.g., 12345678-0001) |
| `cac_document` | file | No | CAC registration certificate (PDF, JPG, PNG) |
| `tin_document` | file | No | TIN certificate (PDF, JPG, PNG) |
| `proof_of_address` | file | No | Utility bill or lease agreement (PDF, JPG, PNG) |
| `business_license` | file | No | Business operating license (PDF, JPG, PNG) |

#### Example Request (JavaScript/Fetch)
```javascript
const formData = new FormData();
formData.append('business_type', 'dealership');
formData.append('business_name', 'ABC Motors Limited');
formData.append('cac_number', 'RC123456');
formData.append('tin_number', '12345678-0001');
formData.append('business_address', '123 Main Street, Victoria Island, Lagos');
formData.append('business_email', 'info@abcmotors.com');
formData.append('business_phone', '+2348012345678');
formData.append('cac_document', cacFileInput.files[0]);
formData.append('tin_document', tinFileInput.files[0]);
formData.append('proof_of_address', addressFileInput.files[0]);
formData.append('business_license', licenseFileInput.files[0]);

const response = await fetch('https://dev.veyu.cc/api/v1/accounts/verify-business/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

#### Response - Success (201 Created)
```json
{
  "error": false,
  "message": "Business verification submitted successfully. Admin will review your submission.",
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "business_type": "dealership",
    "status": "pending",
    "business_name": "ABC Motors Limited",
    "cac_number": "RC123456",
    "tin_number": "12345678-0001",
    "business_address": "123 Main Street, Victoria Island, Lagos",
    "business_email": "info@abcmotors.com",
    "business_phone": "+2348012345678",
    "cac_document": "/media/verification/cac/document.pdf",
    "tin_document": "/media/verification/tin/document.pdf",
    "proof_of_address": "/media/verification/address/document.pdf",
    "business_license": "/media/verification/license/document.pdf",
    "rejection_reason": null,
    "date_created": "2025-10-20T14:30:00Z",
    "last_updated": "2025-10-20T14:30:00Z",
    "business_verification_status": "Pending Review"
  }
}
```

#### Response - Error (400 Bad Request)
```json
{
  "error": true,
  "message": "Validation failed",
  "errors": {
    "business_name": ["This field is required."],
    "business_email": ["Enter a valid email address."]
  }
}
```

---

### 3. Login Response Enhancement

**POST** `/login/`

The login endpoint now includes `business_verification_status` for dealers and mechanics.

#### Response Example (Dealer)
```json
{
  "id": 123,
  "email": "dealer@example.com",
  "token": "abc123token",
  "refresh": "refresh_token_here",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "dealer",
  "provider": "veyu",
  "is_active": true,
  "dealerId": "550e8400-e29b-41d4-a716-446655440000",
  "verified_id": true,
  "verified_business": false,
  "business_verification_status": "pending"
}
```

#### Response Example (Mechanic)
```json
{
  "id": 456,
  "email": "mechanic@example.com",
  "token": "xyz789token",
  "refresh": "refresh_token_here",
  "first_name": "Jane",
  "last_name": "Smith",
  "user_type": "mechanic",
  "provider": "veyu",
  "is_active": true,
  "mechanicId": "660e8400-e29b-41d4-a716-446655440001",
  "verified_id": true,
  "verified_business": true,
  "business_verification_status": "verified"
}
```

---

## Verification Status Flow

```
┌─────────────────┐
│  not_submitted  │  ← Initial state (no submission yet)
└────────┬────────┘
         │
         │ User submits form
         ↓
┌─────────────────┐
│     pending     │  ← Awaiting admin review
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         │ Admin approves  │ Admin rejects
         ↓                 ↓
┌─────────────────┐  ┌─────────────────┐
│    verified     │  │    rejected     │
└─────────────────┘  └────────┬────────┘
                              │
                              │ User resubmits
                              ↓
                     ┌─────────────────┐
                     │     pending     │
                     └─────────────────┘
```

---

## Status Values

| Status | Display | Description |
|--------|---------|-------------|
| `not_submitted` | Not Submitted | User hasn't submitted verification yet |
| `pending` | Pending Review | Submitted and waiting for admin approval |
| `verified` | Verified | Approved by admin - business is verified |
| `rejected` | Rejected | Rejected by admin - check `rejection_reason` |

---

## Frontend Implementation Guide

### 1. Check Status on Login
```javascript
// After successful login
if (userData.user_type === 'dealer' || userData.user_type === 'mechanic') {
  const verificationStatus = userData.business_verification_status;
  
  switch(verificationStatus) {
    case 'not_submitted':
      // Show "Complete Verification" button/banner
      break;
    case 'pending':
      // Show "Verification Pending" status badge
      break;
    case 'verified':
      // Show verified badge/checkmark
      break;
    case 'rejected':
      // Show rejection message and "Resubmit" button
      break;
  }
}
```

### 2. Verification Form Component
```javascript
const VerificationForm = () => {
  const [formData, setFormData] = useState({
    business_type: 'dealership', // or 'mechanic'
    business_name: '',
    cac_number: '',
    tin_number: '',
    business_address: '',
    business_email: '',
    business_phone: '',
  });
  
  const [files, setFiles] = useState({
    cac_document: null,
    tin_document: null,
    proof_of_address: null,
    business_license: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Append text fields
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    // Append files
    Object.keys(files).forEach(key => {
      if (files[key]) {
        formDataToSend.append(key, files[key]);
      }
    });
    
    try {
      const response = await fetch('/api/v1/accounts/verify-business/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.error) {
        // Handle validation errors
        console.error(data.errors);
      } else {
        // Success - show confirmation
        alert(data.message);
      }
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };
  
  // ... render form
};
```

### 3. Status Check Component
```javascript
const VerificationStatus = () => {
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch('/api/v1/accounts/verify-business/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStatus(data);
    };
    
    fetchStatus();
  }, []);
  
  if (!status) return <div>Loading...</div>;
  
  return (
    <div className={`status-badge status-${status.status}`}>
      <span>{status.status_display}</span>
      {status.rejection_reason && (
        <p className="rejection-reason">{status.rejection_reason}</p>
      )}
    </div>
  );
};
```

### 4. Status Badge Styling
```css
.status-badge {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
}

.status-not_submitted {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-verified {
  background-color: #d1fae5;
  color: #059669;
}

.status-rejected {
  background-color: #fee2e2;
  color: #dc2626;
}
```

---

## Error Handling

### Common Errors

1. **401 Unauthorized**
   - Token expired or invalid
   - Action: Redirect to login

2. **400 Bad Request**
   - Validation errors
   - Action: Display field-specific errors to user

3. **404 Not Found**
   - Business profile doesn't exist
   - Action: Contact support (shouldn't happen in normal flow)

### Example Error Handler
```javascript
const handleApiError = (response, data) => {
  switch(response.status) {
    case 400:
      // Show validation errors
      if (data.errors) {
        Object.keys(data.errors).forEach(field => {
          showFieldError(field, data.errors[field][0]);
        });
      }
      break;
    case 401:
      // Redirect to login
      window.location.href = '/login';
      break;
    case 404:
      alert('Business profile not found. Please contact support.');
      break;
    default:
      alert('An error occurred. Please try again.');
  }
};
```

---

## Testing

### Test Accounts
- **Dealer**: `dealer@test.com` / `password123`
- **Mechanic**: `mechanic@test.com` / `password123`

### Swagger UI
Access interactive API documentation at:
```
https://dev.veyu.cc/swagger/
```

### Test Workflow
1. Login as dealer/mechanic
2. Check status (should be `not_submitted`)
3. Submit verification form
4. Check status (should be `pending`)
5. Admin approves/rejects in admin panel
6. Check status again (should be `verified` or `rejected`)

---

## Notes

- **File Size Limits**: Max 5MB per file (configurable in backend)
- **Supported Formats**: PDF, JPG, JPEG, PNG
- **Resubmission**: Users can resubmit after rejection (status resets to `pending`)
- **Admin Panel**: Admins can view, approve, or reject submissions at `/admin/accounts/businessverificationsubmission/`

---

## Support

For questions or issues, contact the backend team or check the Swagger documentation at `/swagger/`.


