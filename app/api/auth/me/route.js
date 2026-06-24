import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/authHelpers'
import prisma from '@/lib/prisma'
import { getFallbackPayloadForRoute, isDatabaseUnavailableError } from '@/lib/prismaFallback.mjs'

export async function GET(request) {
  try {
    console.log('API: GET /api/auth/me called')
    const session = getSessionFromRequest(request)
    if (!session || !session.id) return NextResponse.json({ user: null })

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({ user })
  } catch (err) {
    console.error(err)
    if (isDatabaseUnavailableError(err)) {
      return NextResponse.json(getFallbackPayloadForRoute('auth-me'))
    }
    return NextResponse.json({ user: null })
  }
}
