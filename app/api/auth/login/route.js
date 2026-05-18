import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSessionCookie, verifyPassword } from '@/lib/authHelpers'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { email, authProvider: 'local' },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const response = NextResponse.json({ message: 'Login successful', user })
    response.headers.set('Set-Cookie', createSessionCookie(user))
    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
