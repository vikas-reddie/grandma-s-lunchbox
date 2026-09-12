import mongoose, { Schema, Document } from 'mongoose'

export interface IBooking extends Document {
  orderId: string
  userId: mongoose.Types.ObjectId
  mealType: 'veg' | 'non-veg'
  planType: 'trial' | 'monthly'
  price: number
  paymentStatus: 'pending' | 'paid' | 'failed'
  bookingStatus: 'active' | 'paused' | 'cancelled' | 'expired'
  startDate: Date
  endDate: Date | null
  deliveryDays: string[]
  userEmail?: string
  userName?: string
  building?: string
  pickupPoint?: string
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<IBooking>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealType: {
      type: String,
      enum: ['veg', 'non-veg'],
      required: true,
    },
    planType: {
      type: String,
      enum: ['trial', 'monthly'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    deliveryDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    userEmail: {
      type: String,
      default: '',
    },
    userName: {
      type: String,
      default: '',
    },
    building: {
      type: String,
      default: '',
    },
    pickupPoint: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema)
