import mongoose, { Document, Schema } from 'mongoose'

export interface IDelivery extends Document {
  bookingId: mongoose.Types.ObjectId
  deliveryDate: Date
  paymentStatus: 'pending' | 'paid'
  deliveryStatus: 'pending' | 'delivered'
  createdAt: Date
  updatedAt: Date
}

const deliverySchema = new Schema<IDelivery>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

deliverySchema.index({ bookingId: 1, deliveryDate: 1 }, { unique: true })

export const Delivery = mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', deliverySchema)
