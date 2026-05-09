# Fixes Applied

## Issue 1: Reservation Expires Immediately ✅ FIXED

### Problem
Reservations were showing as expired immediately after creation instead of waiting 20 minutes.

### Root Cause
Timezone mismatch: Backend stores UTC time, but frontend was parsing the datetime string incorrectly, treating it as local time instead of UTC.

### Solution
- Updated `ReservationDetail.jsx` to properly parse UTC datetime strings
- Added 'Z' suffix to datetime strings if not present to indicate UTC
- Improved date parsing logic to handle various datetime formats
- Added validation to ensure parsed time is valid

### Files Changed
- `frontend/src/pages/ReservationDetail.jsx` - Fixed datetime parsing logic

## Issue 2: Admin Cannot Edit Bank Payment Info ✅ FIXED

### Problem
Bank payment information (account name, bank name, account number, IBAN) was hardcoded in config and couldn't be edited by admin.

### Solution
1. **Database Model**: Created `BankInfo` model to store bank details
2. **Admin Endpoints**: 
   - `GET /admin/bank-info` - Get current bank info
   - `PUT /admin/bank-info` - Update bank info
3. **Updated Bank Details Endpoint**: `/reservations/bank-details` now reads from database (with config fallback)
4. **Admin UI**: Added "Bank Info" tab in Admin panel with form to edit bank details
5. **Seed Script**: Creates default bank info on first run

### Files Changed
- `backend/app/models.py` - Added `BankInfo` model
- `backend/app/schemas.py` - Added `BankInfoUpdate` schema
- `backend/app/routers/admin.py` - Added bank info endpoints
- `backend/app/routers/reservations.py` - Updated to read from DB
- `backend/seed_db.py` - Creates default bank info
- `frontend/src/api.js` - Added bank info API methods
- `frontend/src/pages/Admin.jsx` - Added Bank Info tab
- `frontend/src/LanguageContext.jsx` - Added translations

## Testing Instructions

### Test Reservation Expiration Fix
1. Create a new reservation as a regular user
2. You should see a countdown timer showing ~20 minutes remaining
3. The reservation should NOT show as expired immediately
4. Wait or manually test by checking the timer countdown

### Test Bank Info Management
1. Login as admin (National ID: `admin`, Password: `admin123`)
2. Go to Admin page
3. Click "Bank Info" tab
4. Edit bank details (account name, bank name, account number, IBAN)
5. Click "Save Bank Info"
6. Verify success message appears
7. As a regular user, create a reservation and check the bank details section
8. Verify the updated bank info is displayed

## Database Migration

The `BankInfo` table will be created automatically when you restart the backend server (via SQLAlchemy's `Base.metadata.create_all`).

If you need to manually create it, run:
```bash
cd backend
python seed_db.py
```

This will also create the default bank info entry.
