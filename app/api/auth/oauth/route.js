import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { createSessionCookie, createOAuthStateCookie } from '@/lib/authHelpers'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')

  if (!['google', 'facebook', 'instagram'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  const rawState = randomUUID()
  const state = `${provider}:${rawState}`
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/oauth/callback`

  let authUrl = ''

  switch (provider) {
    case 'google':
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid%20email%20profile&` +
        `state=${encodeURIComponent(state)}&` +
        `access_type=offline`
      break
    case 'facebook':
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${process.env.FACEBOOK_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=email,public_profile&` +
        `state=${encodeURIComponent(state)}`
      break
    case 'instagram':
      authUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${process.env.INSTAGRAM_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=user_profile,user_media&` +
        `state=${encodeURIComponent(state)}`
      break
  }

  const response = NextResponse.redirect(authUrl)
  response.headers.set('Set-Cookie', createOAuthStateCookie(state))
  return response
}