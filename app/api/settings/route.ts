import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Settings } from '@/lib/db/models/Settings'
import { defaultSettings } from '@/lib/config/settings'

export async function GET() {
  try {
    await connectDB()
    const saved = await Settings.findOne({ key: 'global' }).lean()
    return NextResponse.json(saved ? { ...defaultSettings, ...saved, _id: undefined, key: undefined } : defaultSettings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(defaultSettings)
  }
}
