import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Booking } from '@/lib/db/models/Booking'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/jwt'

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

    // Check if user is admin
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count today's meals
    const todaysMeals = await Booking.countDocuments({
      startDate: { $lte: today },
      $or: [
        { endDate: { $gte: tomorrow } },
        { endDate: null },
      ],
      bookingStatus: 'active',
      paymentStatus: 'paid',
    })

    // Count active customers
    const activeCustomers = await Booking.countDocuments({
      bookingStatus: 'active',
    })

    // Count customers on trial
    const trialCustomers = await Booking.countDocuments({
      planType: 'trial',
      bookingStatus: 'active',
    })

    // Calculate total revenue (paid bookings)
    const revenueData = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' },
        },
      },
    ])

    const totalRevenue = revenueData[0]?.total || 0

    // Get bookings expiring in 3 days
    const expiringDate = new Date()
    expiringDate.setDate(expiringDate.getDate() + 3)
    const expiringBookings = await Booking.countDocuments({
      bookingStatus: 'active',
      endDate: { $lte: expiringDate, $gte: today },
    })

    return NextResponse.json(
      {
        metrics: {
          todaysMeals,
          activeCustomers,
          trialCustomers,
          totalRevenue,
          expiringBookings,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching dashboard data' },
      { status: 500 }
    )
  }
}
