// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  phone: string
  pickupPoint?: string
  role: 'customer' | 'admin'
  createdAt?: string
  updatedAt?: string
}

// Booking Types
export interface Booking {
  _id: string
  orderId: string
  userId: string
  mealType: 'veg' | 'non-veg'
  planType: 'trial' | 'monthly'
  price: number
  paymentStatus: 'pending' | 'paid' | 'failed'
  bookingStatus: 'active' | 'paused' | 'cancelled' | 'expired'
  startDate: string | Date
  endDate?: string | Date | null
  deliveryDays?: string[]
  userEmail?: string
  userName?: string
  building?: string
  pickupPoint?: string
  createdAt?: string
  updatedAt?: string
}

// Menu Types
export interface Menu {
  _id: string
  date: string | Date
  dayOfWeek: string
  mainDish: string
  sides: string
  mealType: 'veg' | 'non-veg' | 'both'
  createdAt?: string
  updatedAt?: string
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  name: string
  phone: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  message: string
}

// Booking Request Types
export interface CreateBookingRequest {
  mealType: 'veg' | 'non-veg'
  planType: 'trial' | 'monthly'
  pickupPoint: string
}

// Admin Dashboard Types
export interface AdminMetrics {
  todaysMeals: number
  activeCustomers: number
  trialCustomers: number
  totalRevenue: number
  expiringBookings: number
}

export interface AdminDashboardResponse {
  metrics: AdminMetrics
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
