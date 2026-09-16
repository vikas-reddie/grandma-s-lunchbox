import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Booking } from '@/lib/db/models/Booking'
import { Delivery } from '@/lib/db/models/Delivery'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const actionSchema = z.object({
  deliveryId: z.string().min(1),
  action: z.enum(['paid', 'delivered', 'payment_not_received']),
})

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const decoded = verifyToken(authHeader.substring(7))
  if (!decoded) return false
  const user = await User.findById(decoded.userId)
  return user?.role === 'admin'
}

function dateRange(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + 1)
  return { date, nextDate }
}

function indiaDateValue(value: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    if (!await requireAdmin(request)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const dateValue = request.nextUrl.searchParams.get('date')
    const search = request.nextUrl.searchParams.get('search')?.trim() || ''
    if (!dateValue) {
      return NextResponse.json({ error: 'Delivery date is required' }, { status: 400 })
    }

    const { date, nextDate } = dateRange(dateValue)
    const activeFilter: Record<string, unknown> = {
      bookingStatus: 'active',
      startDate: { $lt: nextDate },
      $or: [{ endDate: null }, { endDate: { $gte: date } }],
    }
    if (search) {
      activeFilter.$and = [{ $or: [
        { userName: { $regex: search, $options: 'i' } },
        { userPhone: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
        { pickupPoint: { $regex: search, $options: 'i' } },
      ] }]
    }

    const bookings = await Booking.find(activeFilter).sort({ userName: 1 }).lean()
    const deliveryRecords = await Promise.all(bookings.map(async (booking) => {
      const delivery = await Delivery.findOneAndUpdate(
        { bookingId: booking._id, deliveryDate: date },
        { $setOnInsert: { bookingId: booking._id, deliveryDate: date } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean()
      const previousPaidDelivery = await Delivery.findOne({
        bookingId: booking._id,
        paymentStatus: 'paid',
      }).lean()
      const hasPaidOrder = booking.paymentStatus === 'paid' || Boolean(previousPaidDelivery)

      if (hasPaidOrder && delivery.paymentStatus !== 'paid') {
        await Delivery.updateOne({ _id: delivery._id }, { $set: { paymentStatus: 'paid' } })
      }

      if (hasPaidOrder && booking.paymentStatus !== 'paid') {
        await Booking.updateOne({ _id: booking._id }, { $set: { paymentStatus: 'paid' } })
      }

      return {
        ...booking,
        deliveryId: delivery._id,
        deliveryDate: dateValue,
        paymentStatus: hasPaidOrder ? 'paid' : 'pending',
        deliveryStatus: delivery.deliveryStatus,
        isFirstDay: indiaDateValue(new Date(booking.startDate)) === dateValue,
      }
    }))

    return NextResponse.json({ deliveries: deliveryRecords })
  } catch (error) {
    console.error('Get admin deliveries error:', error)
    return NextResponse.json({ error: 'Unable to load deliveries' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    if (!await requireAdmin(request)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { deliveryId, action } = actionSchema.parse(await request.json())
    const delivery = await Delivery.findById(deliveryId)
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery record not found' }, { status: 404 })
    }

    if (action === 'payment_not_received') {
      await Delivery.deleteMany({ bookingId: delivery.bookingId })
      await Booking.findByIdAndDelete(delivery.bookingId)
      return NextResponse.json({ message: 'Order removed because payment was not received' })
    }

    if (action === 'paid') {
      delivery.paymentStatus = 'paid'
      await Booking.findByIdAndUpdate(delivery.bookingId, { $set: { paymentStatus: 'paid' } })
    } else {
      const booking = await Booking.findById(delivery.bookingId).select('paymentStatus')
      if (delivery.paymentStatus !== 'paid' && booking?.paymentStatus !== 'paid') {
        return NextResponse.json({ error: 'Payment must be marked paid first' }, { status: 400 })
      }
      delivery.deliveryStatus = 'delivered'
    }

    await delivery.save()
    return NextResponse.json({ delivery })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.issues?.[0]?.message || 'Invalid delivery action' }, { status: 400 })
    }
    console.error('Update admin delivery error:', error)
    return NextResponse.json({ error: 'Unable to update delivery' }, { status: 500 })
  }
}
