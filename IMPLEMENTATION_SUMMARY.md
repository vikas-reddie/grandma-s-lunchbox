# Grandma's Lunchbox - Backend Implementation Complete ✅

## 📊 Project Summary

A **complete backend system** built inside Next.js (no separate server needed!) with all features for meal booking, admin management, and email notifications.

---

## 🎯 What You Have Now

### 1. **User Authentication** ✅
- Signup page: `/auth/signup`
- Login page: `/auth/login`
- Automatic token management
- Password hashing with bcryptjs
- JWT-based authentication

### 2. **Meal Booking System** ✅
- Users can book meals at `/order`
- Choose between Veg/Non-Veg
- Choose between Trial (5 days for ₹299) or Monthly (₹1,299)
- Select pickup location
- Automatic order ID generation
- Order confirmation email sent automatically
- Booking tracked in database

### 3. **Admin Dashboard** ✅
- Access at `/admin`
- Real-time metrics:
  - Today's meals count
  - Active customers
  - Trial customers count
  - Monthly revenue
  - Subscriptions expiring soon
- Browse all bookings with filters
- Update payment status (Pending/Paid/Failed)
- Update booking status (Active/Paused/Cancelled/Expired)
- Search bookings by order ID or customer name
- View customer list

### 4. **Email Notifications** ✅
- Order confirmation emails sent when user books
- Beautiful HTML email template
- Contains order details, price, start date, pickup location
- Configured with Gmail SMTP (or any email provider)

### 5. **Database (MongoDB)** ✅
- 3 main collections:
  - **Users** - Customer & admin accounts
  - **Bookings** - All meal bookings with status
  - **Menus** - Weekly meal information
- Full schema validation with Mongoose
- Relationships between collections

### 6. **REST APIs** ✅
Built-in endpoints (no manual setup needed):
- Auth: signup, login, get profile
- Bookings: create, list, update, delete
- Admin: dashboard, list all bookings, list customers
- Menu: get and manage

---

## 🚀 Quick Start (3 Steps)

### Step 1: Setup MongoDB
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Add to `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
```

### Step 2: Setup Email
1. Go to https://myaccount.google.com/apppasswords
2. Generate app password for Gmail
3. Add to `.env.local`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 3: Update JWT Secret
Add to `.env.local`:
```
JWT_SECRET=super_secret_key_change_in_production
```

Then start: `npm run dev`

---

## 📂 File Organization

```
Organized in the app:

Authentication
└── lib/auth/
    ├── jwt.ts (token & password functions)
    └── AuthContext.tsx (React context for auth)

Database
└── lib/db/
    ├── connect.ts (MongoDB connection)
    └── models/
        ├── User.ts
        ├── Booking.ts
        └── Menu.ts

Email Service
└── lib/email/
    ├── sendEmail.ts
    └── templates/
        └── orderConfirmation.ts

API Routes
└── app/api/
    ├── auth/ (signup, login, me)
    ├── bookings/ (user bookings)
    ├── admin/ (dashboard, bookings, customers, menu)
    └── menu/ (public menu)

Frontend Pages
└── app/
    ├── auth/
    │   ├── signup/page.tsx
    │   └── login/page.tsx
    ├── order/page.tsx (booking page - UPDATED)
    ├── admin/page.tsx (dashboard - UPDATED)
    └── ...
```

---

## 🔐 How It Works

### Booking Flow
```
1. User visits /auth/signup → Creates account
   └─ Name, Email, Phone, Password saved to MongoDB
   └─ JWT token generated and stored in localStorage

2. User visits /order → Creates meal booking
   └─ Selects Veg/Non-Veg and Trial/Monthly
   └─ Enters building and pickup point
   └─ Submits form → POST /api/bookings
   └─ Backend generates Order ID (ORD-2026-XXXXX)
   └─ Booking saved to MongoDB
   └─ Confirmation email sent via Gmail SMTP
   └─ Success page shown with Order ID

3. Admin visits /admin → Views all bookings
   └─ Dashboard shows metrics (today's meals, revenue, etc.)
   └─ Can search and filter bookings
   └─ Can update payment status and booking status
   └─ Real-time updates from database
```

### Email Flow
```
User creates booking
   ↓
Backend calls sendEmail() function
   ↓
orderConfirmationTemplate() generates beautiful HTML
   ↓
Nodemailer sends via Gmail SMTP
   ↓
User receives email with:
   - Order ID
   - Meal type
   - Price
   - Start date
   - Pickup location
   - "Pay on first delivery" note
```

---

## 🎮 Test Everything

### Test User Signup
1. Go to http://localhost:3000/auth/signup
2. Fill form: Name, Email, Phone, Password
3. Click "Create account & continue"
4. Should redirect to `/order` and token saved

### Test Booking
1. At `/order` page, select meal type and plan
2. Enter building and pickup point
3. Click "Confirm order"
4. Should see success with Order ID
5. **Check email inbox** - you should receive confirmation!

### Test Admin Dashboard
1. Need admin account (manually create in MongoDB with role: "admin")
2. Go to http://localhost:3000/auth/login
3. Login with admin account
4. Redirects to http://localhost:3000/admin
5. See metrics and all bookings in table
6. Can update status and payment in dropdowns

---

## 📱 All Routes

### Public Routes
- `/` - Home page
- `/auth/signup` - Create account
- `/auth/login` - Login

### Protected User Routes  
- `/order` - Create booking (requires login)

### Admin-Only Routes
- `/admin` - Dashboard with metrics and bookings
- `/admin/customers` - Customer list
- `/admin/menu` - Menu management

---

## 💾 Database Collections

### Users
```
{
  email: "user@example.com",
  name: "John Doe",
  phone: "9876543210",
  password: "hashed_password",
  building: "Building A",
  pickupPoint: "Main Gate",
  role: "customer" | "admin"
}
```

### Bookings
```
{
  orderId: "ORD-2026-00123",
  userId: ObjectId,
  mealType: "veg" | "non-veg",
  planType: "trial" | "monthly",
  price: 299 | 1299,
  paymentStatus: "pending" | "paid" | "failed",
  bookingStatus: "active" | "paused" | "cancelled" | "expired",
  startDate: Date,
  endDate: Date | null,
  userEmail: "user@example.com",
  userName: "John Doe",
  building: "Building A",
  pickupPoint: "Main Gate"
}
```

### Menus
```
{
  date: "2026-09-15",
  dayOfWeek: "Monday",
  mainDish: "Paneer Butter Masala",
  sides: "Rice, Salad",
  mealType: "veg" | "non-veg" | "both"
}
```

---

## 🔧 API Endpoints Quick Reference

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/auth/signup` | Register user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/bookings` | Create booking | ✅ |
| GET | `/api/bookings` | List user's bookings | ✅ |
| GET | `/api/bookings/:id` | Get booking details | ✅ |
| PATCH | `/api/bookings/:id` | Update booking | ✅ |
| GET | `/api/admin/dashboard` | Admin metrics | ✅ Admin |
| GET | `/api/admin/bookings` | All bookings | ✅ Admin |
| PATCH | `/api/admin/bookings` | Update booking | ✅ Admin |
| GET | `/api/admin/customers` | All customers | ✅ Admin |
| POST | `/api/admin/menu` | Create menu | ✅ Admin |
| GET | `/api/menu` | Get menu | ❌ |

---

## ⚙️ Environment Variables

Your `.env.local` should have:
```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db

# JWT
JWT_SECRET=your_secret_key_here

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@grandmaslunchbox.com

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🎯 What's Connected

✅ Signup form → `/api/auth/signup` → MongoDB Users collection  
✅ Login form → `/api/auth/login` → JWT token generation  
✅ Order form → `/api/bookings` → MongoDB Bookings collection  
✅ Booking created → Email sent automatically  
✅ Admin dashboard → `/api/admin/dashboard` → Real-time metrics  
✅ Admin bookings table → `/api/admin/bookings` → Filterable & searchable  
✅ Update status → `/api/admin/bookings` PATCH → Database updated  

---

## 🚨 Important Notes

1. **Admin Account** - Create manually in MongoDB:
   - Change a user's `role` field to `"admin"` in database
   - Admin users can access `/admin` pages

2. **Email** - Currently uses Gmail
   - Needs Gmail app password (not regular password)
   - Check spam folder if email not received

3. **Tokens** - Stored in `localStorage`
   - Expire after 30 days
   - User needs to login again when expired

4. **Order IDs** - Auto-generated as `ORD-2026-XXXXX`
   - Random 5-digit number
   - Unique for each booking

---

## 🎓 Learning Path

To understand this better:
1. Read `BACKEND_SETUP.md` for detailed setup
2. Look at `lib/db/models/` to see database structure
3. Browse `app/api/` to see endpoint logic
4. Check `app/order/page.tsx` to see frontend API integration
5. Check `app/admin/page.tsx` to see dashboard integration

---

## ✨ Features Summary

- ✅ User registration and login
- ✅ Meal booking with automatic order ID
- ✅ Payment tracking (pending/paid/failed)
- ✅ Booking status management
- ✅ Email confirmations
- ✅ Admin dashboard with real-time metrics
- ✅ Booking search and filter
- ✅ Admin status updates
- ✅ MongoDB database with 3 collections
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Input validation

---

## 🎉 Ready to Go!

Everything is implemented and ready. Just:
1. Configure `.env.local` with MongoDB & Email
2. Run `npm run dev`
3. Visit http://localhost:3000
4. Test signup → booking → admin dashboard

**That's it! Your complete backend is live! 🚀**
