import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/authHelpers'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const session = getSessionFromRequest(request)
    if (!session || !session.id) return NextResponse.json({ user: null })

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({ user })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ user: null })
  }
}
