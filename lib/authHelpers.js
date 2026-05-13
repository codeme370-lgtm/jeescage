import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export function createSessionCookie(user) {
  const sessionPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    authProvider: user.authProvider || 'local',
  }

  const encoded = Buffer.from(JSON.stringify(sessionPayload)).toString('base64')
  const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''

  return `session=${encoded}; Path=/; ${secureFlag}HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
}

export function clearSessionCookie() {
  return 'session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax;'
}

export function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const sessionCookie = cookieHeader
    .split('; ')
    .find((c) => c.startsWith('session='))
  if (!sessionCookie) return null

  try {
    const base64Value = sessionCookie.split('=')[1]
    const payload = JSON.parse(Buffer.from(base64Value, 'base64').toString('utf8'))
    return payload
  } catch (err) {
    console.error('Failed to parse session cookie', err)
    return null
  }
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, key] = stored.split(':')
  const derivedKey = scryptSync(password, salt, 64)
  return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey)
}

export function createOAuthStateCookie(state) {
  const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  return `oauth_state=${state}; Path=/; ${secureFlag}HttpOnly; SameSite=Lax; Max-Age=600`
}

export function clearOAuthStateCookie() {
  return 'oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax;'
}

export function getOAuthStateFromRequest(request) {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const stateCookie = cookieHeader
    .split('; ')
    .find((c) => c.startsWith('oauth_state='))
  if (!stateCookie) return null
  return stateCookie.split('=')[1]
}

export function getSessionUserId(request) {
  const session = getSessionFromRequest(request)
  return session?.id || null
}
