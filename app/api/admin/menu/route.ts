import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Menu } from '@/lib/db/models/Menu'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const createMenuSchema = z.object({
  date: z.string(),
  dayOfWeek: z.string(),
  mainDish: z.string().min(1, 'Main dish is required'),
  sides: z.string().min(1, 'Sides are required'),
  mealType: z.enum(['veg', 'non-veg', 'both']).optional(),
})

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

    await User.findById(decoded.userId)

    const body = await request.json()
    const { date, dayOfWeek, mainDish, sides, mealType } = createMenuSchema.parse(body)

    // Check if menu already exists for this date
    const existingMenu = await Menu.findOne({ date: new Date(date) })
    if (existingMenu) {
      return NextResponse.json(
        { error: 'Menu already exists for this date' },
        { status: 400 }
      )
    }

    const menu = new Menu({
      date: new Date(date),
      dayOfWeek,
      mainDish,
      sides,
      mealType: mealType || 'both',
    })

    await menu.save()

    return NextResponse.json(
      {
        message: 'Menu created successfully',
        menu,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create menu error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'An error occurred while creating the menu' },
      { status: 500 }
    )
  }
}
