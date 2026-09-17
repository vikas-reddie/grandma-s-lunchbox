import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Booking } from '@/lib/db/models/Booking'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { generateOrderId } from '@/lib/utils/generateOrderId'
import { sendEmail } from '@/lib/email/sendEmail'
import { orderConfirmationTemplate } from '@/lib/email/templates/orderConfirmation'
import { z } from 'zod'
import { Settings } from '@/lib/db/models/Settings'
import { defaultSettings } from '@/lib/config/settings'

const createBookingSchema = z.object({
  mealType: z.enum(['veg', 'non-veg']),
  planType: z.enum(['trial', 'monthly']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must contain exactly 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  pickupPoint: z.string().min(1, 'Pickup point is required'),
  startDate: z.string().optional(),
})

// GET - Fetch user's bookings
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Fetch bookings for this user
    const bookings = await Booking.find({ userId: decoded.userId }).sort({ createdAt: -1 })

    return NextResponse.json(
      {
        bookings,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching bookings' },
      { status: 500 }
    )
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    console.log('[BOOKING] POST request received')
    await connectDB()
    console.log('[BOOKING] MongoDB connection ready')

    // A token is optional so customers can place a guest order.
    const authHeader = request.headers.get('authorization')
    const body = await request.json()
    console.log('[BOOKING] Request body:', {
      ...body,
      password: undefined,
    })
    const { mealType, planType, name, phone, email, pickupPoint, startDate: startDateValue } = createBookingSchema.parse(body)

    let user = null
    if (authHeader?.startsWith('Bearer ')) {
      const decoded = verifyToken(authHeader.substring(7))
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }
      user = await User.findById(decoded.userId)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      user.pickupPoint = pickupPoint
      await user.save()
      console.log('[BOOKING] Authenticated customer:', user._id.toString())
    }

    // Calculate price
    const savedSettings = await Settings.findOne({ key: 'global' }).lean()
    const plans = savedSettings?.plans || defaultSettings.plans
    const delivery = savedSettings?.delivery || defaultSettings.delivery
    const price = planType === 'trial' ? plans.trialPrice : plans.monthlyPrice

    // Generate order ID
    const orderId = await generateOrderId()

    // Calculate end date (trial = 5 days, monthly = 30 days from today)
    const startDate = startDateValue ? new Date(`${startDateValue}T00:00:00+05:30`) : new Date()
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Invalid start date' }, { status: 400 })
    }
    const endDate = new Date(startDate)
    endDate.setDate(
      startDate.getDate() + (planType === 'trial' ? delivery.trialDays : delivery.monthlyDays)
    )

    // Create booking
    const booking = new Booking({
      orderId,
      ...(user ? { userId: user._id } : {}),
      mealType,
      planType,
      price,
      paymentStatus: 'pending',
      bookingStatus: 'enrolled',
      startDate,
      endDate: planType === 'trial' ? endDate : null,
      userEmail: email || user?.email || '',
      userPhone: phone,
      userName: user?.name || name,
      pickupPoint,
    })

    console.log('[BOOKING] Saving booking:', {
      orderId,
      userId: user?._id?.toString() || 'guest',
      userName: booking.userName,
      userEmail: booking.userEmail || '(none)',
    })
    await booking.save()
    // Keep guest phone numbers persisted even when a long-running dev process has an older cached model.
    await Booking.collection.updateOne(
      { _id: booking._id },
      { $set: { userPhone: phone } },
    )
    console.log('[BOOKING] Booking saved:', {
      id: booking._id.toString(),
      orderId: booking.orderId,
    })

    if (email || user?.email) {
      const emailHtml = orderConfirmationTemplate({
        orderId,
        userName: user?.name || name,
        mealType: mealType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian',
        planType: planType === 'trial' ? '5-Day Trial' : 'Monthly',
        price: `₹${price}`,
        startDate: startDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        endDate: endDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        pickupPoint,
      })
      await sendEmail(email || user!.email, `Order Confirmed - ${orderId}`, emailHtml)
    }

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: {
          id: booking._id,
          orderId: booking.orderId,
          mealType: booking.mealType,
          planType: booking.planType,
          price: booking.price,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create booking error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.issues?.[0]?.message || 'Invalid booking details' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'An error occurred while creating the booking' },
      { status: 500 }
    )
  }
}
