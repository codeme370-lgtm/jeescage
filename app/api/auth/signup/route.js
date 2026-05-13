import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { createSessionCookie, hashPassword } from '@/lib/authHelpers'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Full name, email, phone, and password are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name },
          { email },
          { phone },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'A user with that name, email, or phone already exists' }, { status: 409 })
    }

    const hashedPassword = hashPassword(password)

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        phone,
        password: hashedPassword,
        image: '',
        authProvider: 'local',
        providerId: null,
        cart: {},
      },
    })

    const response = NextResponse.json({ message: 'Signup successful', user })
    response.headers.set('Set-Cookie', createSessionCookie(user))
    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
