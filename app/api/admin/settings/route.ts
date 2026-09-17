import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { Settings } from '@/lib/db/models/Settings'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/jwt'
import { defaultSettings } from '@/lib/config/settings'
import { z } from 'zod'

const settingsSchema = z.object({
  plans: z.object({ trialPrice: z.number().nonnegative(), monthlyPrice: z.number().nonnegative() }),
  pickupPoints: z.array(z.string().min(1)).min(1),
  location: z.object({ city: z.string().min(1), state: z.string().min(1), areaDescription: z.string().min(1) }),
  contact: z.object({ name: z.string().min(1), phone: z.string().min(1), whatsapp: z.string().min(1), email: z.string() }),
  payment: z.object({ upiId: z.string().min(1), payeeName: z.string().min(1) }),
  delivery: z.object({ days: z.array(z.string().min(1)).min(1), time: z.string().min(1), trialDays: z.number().int().positive(), monthlyDays: z.number().int().positive() }),
})

async function isAdmin(request: NextRequest) {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return false
  const token = verifyToken(header.substring(7))
  if (!token) return false
  const user = await User.findById(token.userId)
  return user?.role === 'admin'
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    if (!await isAdmin(request)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    const saved = await Settings.findOne({ key: 'global' }).lean()
    return NextResponse.json(saved ? { ...defaultSettings, ...saved, _id: undefined, key: undefined } : defaultSettings)
  } catch (error) {
    console.error('Get admin settings error:', error)
    return NextResponse.json({ error: 'Unable to load settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    if (!await isAdmin(request)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    const values = settingsSchema.parse(await request.json())
    const saved = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: values, $setOnInsert: { key: 'global' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()
    return NextResponse.json({ ...defaultSettings, ...saved, _id: undefined, key: undefined })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.issues?.[0]?.message || 'Invalid settings' }, { status: 400 })
    console.error('Update admin settings error:', error)
    return NextResponse.json({ error: 'Unable to save settings' }, { status: 500 })
  }
}
