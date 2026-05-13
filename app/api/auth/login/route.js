import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSessionCookie, verifyPassword } from '@/lib/authHelpers'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, password } = body

    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { name, authProvider: 'local' },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid name or password' }, { status: 401 })
    }

    const response = NextResponse.json({ message: 'Login successful', user })
    response.headers.set('Set-Cookie', createSessionCookie(user))
    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
