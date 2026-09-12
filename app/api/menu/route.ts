import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Menu } from '@/lib/db/models/Menu'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '7') // Default to 7 days

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get menu for the next N days
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + days)

    const menu = await Menu.find({
      date: {
        $gte: today,
        $lte: endDate,
      },
    }).sort({ date: 1 })

    return NextResponse.json(
      {
        menu,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get menu error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the menu' },
      { status: 500 }
    )
  }
}
