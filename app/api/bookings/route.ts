import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Booking } from '@/lib/db/models/Booking'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { generateOrderId } from '@/lib/utils/generateOrderId'
import { sendEmail } from '@/lib/email/sendEmail'
import { orderConfirmationTemplate } from '@/lib/email/templates/orderConfirmation'
import { z } from 'zod'

const createBookingSchema = z.object({
  mealType: z.enum(['veg', 'non-veg']),
  planType: z.enum(['trial', 'monthly']),
  building: z.string().min(1, 'Building is required'),
  pickupPoint: z.string().min(1, 'Pickup point is required'),
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

    const body = await request.json()
    const { mealType, planType, building, pickupPoint } = createBookingSchema.parse(body)

    // Get user details
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user building and pickup point
    user.building = building
    user.pickupPoint = pickupPoint
    await user.save()

    // Calculate price
    const price = planType === 'trial' ? 299 : 1299

    // Generate order ID
    const orderId = generateOrderId()

    // Calculate end date (trial = 5 days, monthly = 30 days from today)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(
      endDate.getDate() + (planType === 'trial' ? 5 : 30)
    )

    // Create booking
    const booking = new Booking({
      orderId,
      userId: user._id,
      mealType,
      planType,
      price,
      paymentStatus: 'pending',
      bookingStatus: 'active',
      startDate,
      endDate: planType === 'trial' ? endDate : null,
      userEmail: user.email,
      userName: user.name,
      building,
      pickupPoint,
    })

    await booking.save()

    // Send confirmation email
    const emailHtml = orderConfirmationTemplate({
      orderId,
      userName: user.name,
      mealType: mealType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian',
      planType: planType === 'trial' ? '5-Day Trial' : 'Monthly',
      price: `₹${price}`,
      startDate: startDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      building,
      pickupPoint,
    })

    await sendEmail(
      user.email,
      `Order Confirmed - ${orderId}`,
      emailHtml
    )

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: {
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
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'An error occurred while creating the booking' },
      { status: 500 }
    )
  }
}
