# Grandma's Lunchbox - Backend Setup Guide

## 🚀 Overview

Complete backend implementation for Grandma's Lunchbox built entirely within Next.js using:
- **API Routes** for REST endpoints
- **MongoDB** for database
- **Nodemailer** for email notifications
- **JWT** for authentication
- **Zod** for validation

---

## 📋 What's Implemented

### ✅ Authentication System
- User signup with email, name, phone, and password
- User login with JWT tokens
- Protected endpoints with token verification
- User profile retrieval

### ✅ Booking System
- Users can create meal bookings (Veg/Non-Veg, Trial/Monthly)
- Automatic order ID generation (ORD-2026-XXXXX)
- Payment tracking (Pending/Paid/Failed)
- Booking status management (Active/Paused/Cancelled/Expired)
- Email confirmation sent on booking

### ✅ Admin Dashboard
- Real-time metrics:
  - Today's meals count
  - Active customers
  - Monthly revenue
  - Expiring subscriptions
- Browse all bookings with filters
- Update booking status and payment status
- View customer information

### ✅ Email Notifications
- Order confirmation emails
- User-friendly templates with all booking details

---

## 🔧 Environment Setup

### 1. MongoDB Setup
You need a MongoDB database. Get free tier at: https://www.mongodb.com/cloud/atlas

1. Create a free account and cluster
2. Create a database user
3. Get your connection string
4. Update `.env.local` with your MongoDB URI:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grandmas-lunchbox?retryWrites=true&w=majority
```

### 2. Email Service Setup
Currently configured for **Gmail SMTP**:

1. Enable 2-Step Verification on your Gmail account
2. Generate an "App Password": https://myaccount.google.com/apppasswords
3. Update `.env.local`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@grandmaslunchbox.com
```

### 3. JWT Secret
Update `.env.local` with a strong secret (change this in production):

```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 4. Complete `.env.local`
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/grandmas-lunchbox?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@grandmaslunchbox.com

# Next.js Environment
NODE_ENV=production
```

---

## 📁 File Structure

```
api/
├── auth/
│   ├── signup/route.ts       → Register new user
│   ├── login/route.ts        → Authenticate user
│   └── me/route.ts           → Get current user
├── bookings/
│   ├── route.ts              → Create & list user's bookings
│   └── [id]/route.ts         → Get, update, delete booking
├── admin/
│   ├── dashboard/route.ts    → Admin metrics
│   ├── bookings/route.ts     → List all bookings (admin)
│   ├── customers/route.ts    → List all customers (admin)
│   └── menu/route.ts         → Manage menu (admin)
└── menu/
    └── route.ts              → Get menu (public)

lib/
├── db/
│   ├── connect.ts            → MongoDB connection
│   └── models/
│       ├── User.ts
│       ├── Booking.ts
│       └── Menu.ts
├── auth/
│   ├── jwt.ts                → Token management
│   └── AuthContext.tsx       → React auth context
└── email/
    ├── sendEmail.ts          → Email service
    └── templates/
        └── orderConfirmation.ts
```

---

## 🔌 API Endpoints

### Authentication

**POST /api/auth/signup**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "9876543210",
  "password": "password123"
}
```
Returns: `{ user, token }`

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Returns: `{ user, token }`

**GET /api/auth/me**
Headers: `Authorization: Bearer {token}`
Returns: `{ user }`

### Bookings

**POST /api/bookings** - Create booking
```json
{
  "mealType": "veg",
  "planType": "trial",
  "building": "Building A",
  "pickupPoint": "Main Gate"
}
```
Returns: `{ booking, message }`

**GET /api/bookings** - List user's bookings
Headers: `Authorization: Bearer {token}`

**GET /api/bookings/:id** - Get booking details
Headers: `Authorization: Bearer {token}`

**PATCH /api/bookings/:id** - Update booking
```json
{
  "bookingStatus": "paused",
  "paymentStatus": "paid"
}
```

### Admin Dashboard

**GET /api/admin/dashboard**
Headers: `Authorization: Bearer {token}` (admin only)
Returns: `{ metrics: { todaysMeals, activeCustomers, totalRevenue, ... } }`

**GET /api/admin/bookings**
Query params: `?search=ORD&status=active&paymentStatus=paid`
Headers: `Authorization: Bearer {token}` (admin only)

**PATCH /api/admin/bookings** - Update booking
```json
{
  "bookingId": "xxx",
  "bookingStatus": "active"
}
```

**GET /api/admin/customers**
Headers: `Authorization: Bearer {token}` (admin only)

---

## 🧪 Testing the Backend

### 1. Test Signup
```bash
curl -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "9876543210",
    "password": "password123"
  }'
```

### 2. Test Login
```bash
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Create Booking
```bash
curl -X POST "$BASE_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mealType": "veg",
    "planType": "trial",
    "name": "Test User",
    "phone": "9876543210",
    "email": "test@example.com",
    "pickupPoint": "Main Gate"
  }'
```

### 4. Get Admin Dashboard
```bash
curl -X GET "$BASE_URL/api/admin/dashboard" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📧 Email Templates

Email confirmation is sent automatically when a user creates a booking with:
- Order ID
- Meal type (Veg/Non-Veg)
- Plan type (Trial/Monthly)
- Price
- Start date
- Pickup point

---

## 🎯 Frontend Integration

### Authentication Flow
```
User visits /auth/signup
  ↓
Fills form and submits
  ↓
POST /api/auth/signup
  ↓
Token stored in localStorage
  ↓
Redirects to /order
```

### Booking Flow
```
User at /order selects meal & plan
  ↓
Enters building & pickup point
  ↓
Clicks "Confirm order"
  ↓
POST /api/bookings with token
  ↓
Email sent automatically
  ↓
Shows success with Order ID
```

### Admin Flow
```
Admin visits /admin/dashboard
  ↓
Fetches metrics from GET /api/admin/dashboard
  ↓
Fetches bookings from GET /api/admin/bookings
  ↓
Can update booking status via PATCH
```

---

## 🔐 Security Notes

1. **JWT Tokens** - Stored in localStorage (consider HTTPOnly cookies for production)
2. **Password Hashing** - Using bcryptjs (10 salt rounds)
3. **Admin Access** - All admin endpoints check user.role === 'admin'
4. **Input Validation** - Using Zod for all API inputs
5. **Error Handling** - Detailed error messages sent to client

---

## 🚀 Running the App

```bash
# Install dependencies (already done)
npm install

# Configure .env.local with MongoDB URI and email credentials

# Start dev server
npm run dev

# Access app
your Vercel deployment URL
```

---

## 📱 Pages

- **Public**: `/` - Home page
- **Auth**: `/auth/signup`, `/auth/login`
- **User**: `/order` - Create bookings
- **Admin**: `/admin` - Dashboard with all bookings and metrics
- **Admin**: `/admin/customers` - Customer list
- **Admin**: `/admin/menu` - Menu management

---

## 🔄 Next Steps (To Implement)

1. **Payment Gateway** - Integrate Razorpay/Stripe for actual payments
2. **Email Templates** - Add more templates (payment confirmed, delivery reminder)
3. **Admin Menu Management** - UI to add weekly menu
4. **Customer Preferences** - Save favorite dishes
5. **Delivery Tracking** - Real-time delivery status
6. **Analytics** - Advanced dashboards and reports
7. **Mobile App** - React Native version

---

## 🐛 Troubleshooting

### "MONGODB_URI is not defined"
- Check `.env.local` has `MONGODB_URI` set
- Restart the dev server after updating `.env.local`

### "Email not sending"
- Verify Gmail app password is correct
- Check if 2FA is enabled on Gmail
- Try a test email manually

### "Admin access denied"
- Make sure you're logged in with an admin account
- User role must be set to 'admin' in database

### "Token expired"
- Tokens expire after 30 days
- User needs to login again to get new token

---

## 📞 Support

For issues, check:
1. Browser console for errors
2. Terminal logs for server errors
3. `.env.local` configuration
4. MongoDB connection status
5. Gmail credentials validity

---

**Happy coding! 🎉**
