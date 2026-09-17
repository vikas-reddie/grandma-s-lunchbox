import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import { User } from '@/lib/db/models/User'
import { hashPassword, verifyPassword, createToken } from '@/lib/auth/jwt'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  username: z.string().min(1, 'Username is required').optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.email || data.username, {
  message: 'Email or username is required',
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, username, password } = loginSchema.parse(body)

    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123'
    const adminEmail = 'admin@grandmalunchbox.local'
    let user = username
      ? await User.findOne({ $or: [{ username }, { email: username }] })
      : await User.findOne({ email })

    if (username === adminUsername && password === adminPassword) {
      user = await User.findOne({ email: adminEmail }) || user

      if (user) {
        const needsAdminSync = !user.name || user.name === 'Administrator' || user.name === adminUsername
        user.username = adminUsername
        user.role = 'admin'
        user.password = await hashPassword(adminPassword)
        if (needsAdminSync) {
          user.name = adminUsername
        }
        await user.save()
      } else {
        user = await User.create({
          username: adminUsername,
          email: adminEmail,
          name: adminUsername,
          phone: '0000000000',
          password: await hashPassword(adminPassword),
          role: 'admin',
        })
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = createToken(user._id.toString(), user.email)

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.issues?.[0]?.message || 'Invalid login details' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
