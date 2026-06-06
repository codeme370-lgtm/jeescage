import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import {
  createSessionCookie,
  createOAuthStateCookie,
  clearOAuthStateCookie,
  getOAuthStateFromRequest,
} from '@/lib/authHelpers'

async function exchangeCodeForToken(provider, code, redirectUri) {
  if (provider === 'google') {
    const params = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    return res.json()
  }

  if (provider === 'facebook') {
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`
    const res = await fetch(tokenUrl)
    return res.json()
  }

  if (provider === 'instagram') {
    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    })
    const res = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: params,
    })
    return res.json()
  }

  return null
}

async function fetchProfile(provider, tokenResponse) {
  if (provider === 'google') {
    const accessToken = tokenResponse.access_token
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res.json()
  }

  if (provider === 'facebook') {
    const accessToken = tokenResponse.access_token
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    )
    return res.json()
  }

  if (provider === 'instagram') {
    // Instagram returns access_token and user_id on exchange
    const accessToken = tokenResponse.access_token || tokenResponse.accessToken
    const userId = tokenResponse.user_id || tokenResponse.user?.id
    if (!accessToken || !userId) return {}
    const res = await fetch(
      `https://graph.instagram.com/${userId}?fields=id,username,account_type,profile_picture_url&access_token=${accessToken}`
    )
    return res.json()
  }

  return {}
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const expectedState = getOAuthStateFromRequest(request)
    if (!expectedState || expectedState !== state) {
      return NextResponse.json({ error: 'Invalid or missing OAuth state' }, { status: 400 })
    }

    // expectedState is in the form "provider:uuid" as set by the start route
    const [expectedProvider] = expectedState.split(':')
    const provider = expectedProvider || 'google'

    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/oauth/callback`

    const tokenResponse = await exchangeCodeForToken(provider, code, redirectUri)
    if (!tokenResponse) return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 })

    const profile = await fetchProfile(provider, tokenResponse)

    // Normalize profile
    let email = ''
    let name = ''
    let image = ''
    let providerId = ''

    if (provider === 'google') {
      email = profile.email || ''
      name = profile.name || profile.given_name || ''
      image = profile.picture || ''
      providerId = profile.id
    } else if (provider === 'facebook') {
      email = profile.email || ''
      name = profile.name || ''
      image = profile.picture?.data?.url || ''
      providerId = profile.id
    } else if (provider === 'instagram') {
      // Instagram may not provide email
      email = ''
      name = profile.username || ''
      image = profile.profile_picture_url || ''
      providerId = profile.id || tokenResponse.user_id || ''
    }

    // Upsert user: prefer providerId, fallback to email
    let user = null
    if (providerId) {
      user = await prisma.user.findFirst({ where: { providerId } })
    }
    if (!user && email) {
      user = await prisma.user.findFirst({ where: { email } })
    }

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          image: image || user.image,
          authProvider: provider,
          providerId: providerId || user.providerId,
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: name || 'No Name',
          email: email || '',
          phone: null,
          password: null,
          image: image || '',
          authProvider: provider,
          providerId: providerId || null,
          cart: {},
        },
      })
    }

    const response = NextResponse.redirect('/')
    // Set session cookie and clear oauth_state
    // append two Set-Cookie headers
    response.headers.append('Set-Cookie', createSessionCookie(user))
    response.headers.append('Set-Cookie', clearOAuthStateCookie())
    return response
  } catch (err) {
    console.error('OAuth callback error', err)
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 })
  }
}
