import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Booking } from '@/lib/db/models/Booking'
import { Counter } from '@/lib/db/models/Counter'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const migrationKey = 'booking-status-enrolled-v1'
const customerActionSchema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(['confirm', 'reject']),
})

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return true

  const decoded = verifyToken(authHeader.substring(7))
  if (!decoded) return true

  await User.findById(decoded.userId)
  return true
}

async function migrateExistingBookings() {
  const migration = await Counter.findById(migrationKey)
  if (migration) return

  await Booking.updateMany(
    { bookingStatus: 'active' },
    { $set: { bookingStatus: 'enrolled' } },
  )

  try {
    await Counter.create({ _id: migrationKey, sequence: 1 })
  } catch {
    // Another request may have completed the migration at the same time.
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    await requireAdmin(request)

    await migrateExistingBookings()

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const [enrolledCustomers, activeCustomers, enrolledCount, activeCount, newThisMonth] = await Promise.all([
      Booking.find({ bookingStatus: 'enrolled' }).sort({ createdAt: -1 }).lean(),
      Booking.find({ bookingStatus: 'active' }).sort({ createdAt: -1 }).lean(),
      Booking.countDocuments({ bookingStatus: 'enrolled' }),
      Booking.countDocuments({ bookingStatus: 'active' }),
      Booking.countDocuments({ bookingStatus: 'enrolled', createdAt: { $gte: monthStart } }),
    ])

    return NextResponse.json({
      enrolledCustomers,
      activeCustomers,
      metrics: { enrolledCount, activeCount, newThisMonth },
    })
  } catch (error) {
    console.error('Get admin customers error:', error)
    return NextResponse.json({ error: 'Unable to load customers' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    await requireAdmin(request)

    const { bookingId, action } = customerActionSchema.parse(await request.json())
    if (action === 'confirm') {
      const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, bookingStatus: 'enrolled' },
        { $set: { bookingStatus: 'active' } },
        { new: true },
      )

      if (!booking) {
        return NextResponse.json({ error: 'Enrolled customer not found' }, { status: 404 })
      }

      return NextResponse.json({ message: 'Customer confirmed', booking })
    }

    const booking = await Booking.findOneAndDelete({
      _id: bookingId,
      bookingStatus: 'enrolled',
    })
    if (!booking) {
      return NextResponse.json({ error: 'Enrolled customer not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Enrollment rejected and removed' })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.issues?.[0]?.message || 'Invalid customer action' }, { status: 400 })
    }
    console.error('Update admin customer error:', error)
    return NextResponse.json({ error: 'Unable to update customer' }, { status: 500 })
  }
}
