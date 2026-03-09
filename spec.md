# ServeNow

## Current State
No existing app. This is a fresh build.

## Requested Changes (Diff)

### Add
- **Service Categories**: Chef, Plumber, Carpenter, Pest Control (expandable)
- **Customer flow**: Browse services, select sub-service, pick date/time slot, enter address, add notes, confirm booking
- **Professional flow**: Register with skills/category, toggle availability, view & accept/decline incoming requests, update job status
- **Booking lifecycle**: Pending → Accepted → In Progress → Completed / Cancelled
- **Reviews & Ratings**: Post-service 1–5 star rating with comments by customer
- **Earnings Dashboard**: For professionals — per-job earnings, total summary
- **My Bookings**: For customers — upcoming, ongoing, completed, cancelled tabs
- **User roles**: Customer vs Professional (role selection on signup)
- **Profile management**: Name, contact info, saved address, service category (professionals)
- **Admin-style approval**: Professionals start with "pending" status until activated

### Modify
Nothing — new project.

### Remove
Nothing — new project.

## Implementation Plan
1. Backend (Motoko):
   - User data store with roles: customer / professional
   - Service categories and sub-services store
   - Booking data store: customer, professional, service, datetime, address, status, notes
   - Review/rating data store linked to completed bookings
   - Earnings record per professional
   - APIs: createBooking, getBookingsByCustomer, getBookingsByProfessional, updateBookingStatus, submitReview, getReviews, toggleAvailability, getProfessionalsByCategory, approveProf, getEarnings

2. Frontend (React + TypeScript + Tailwind):
   - Landing/home page with service category grid
   - Auth: role-based signup/login (customer vs professional)
   - Customer dashboard: home with categories, booking flow (multi-step), my bookings tabs, rate & review
   - Professional dashboard: availability toggle, incoming requests list, accept/decline, job status updates, earnings summary
   - Shared: profile page, booking detail view
   - Responsive, mobile-first layout
