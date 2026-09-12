import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Booking } from '@/lib/db/models/Booking'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const updateBookingSchema = z.object({
  bookingStatus: z.enum(['active', 'paused', 'cancelled', 'expired']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const booking = await Booking.findById(params.id)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({ booking }, { status: 200 })
  } catch (error: any) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updateData = updateBookingSchema.parse(body)

    const booking = await Booking.findById(params.id)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update booking
    if (updateData.bookingStatus) {
      booking.bookingStatus = updateData.bookingStatus
    }
    if (updateData.paymentStatus) {
      booking.paymentStatus = updateData.paymentStatus
    }

    await booking.save()

    return NextResponse.json(
      { message: 'Booking updated successfully', booking },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update booking error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'An error occurred while updating the booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const booking = await Booking.findById(params.id)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await Booking.deleteOne({ _id: params.id })

    return NextResponse.json(
      { message: 'Booking deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting the booking' },
      { status: 500 }
    )
  }
}
