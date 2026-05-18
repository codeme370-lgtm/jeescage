import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server"
import pusher from "@/lib/pusher"
import prisma from "@/lib/prisma"
import authAdmin from "@/middlewares/authAdmin"

export async function POST(req) {
  try {
    const userId = getSessionUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { socket_id, channel_name } = body
    if (!socket_id || !channel_name) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 })
    }

    if (!channel_name.startsWith('private-store-')) {
      return NextResponse.json({ error: "Invalid channel" }, { status: 400 })
    }

    const storeId = channel_name.replace('private-store-', '')
    const store = await prisma.store.findUnique({ where: { id: storeId }, include: { user: true } })
    const currentUser = await prisma.user.findUnique({ where: { id: userId } })

    if (!store) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const normalizedUserEmail = currentUser?.email?.trim().toLowerCase()
    const normalizedStoreUserEmail = store.user?.email?.trim().toLowerCase()
    const normalizedStoreEmail = store.email?.trim().toLowerCase()

    const isAdmin = await authAdmin(userId)
    const envEmails = process.env.STORE_OWNER_EMAILS || ''
    const allowedEmails = envEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    const envMatch = normalizedUserEmail && allowedEmails.includes(normalizedUserEmail)

    const emailMatch = normalizedUserEmail && (
      normalizedStoreUserEmail === normalizedUserEmail ||
      normalizedStoreEmail === normalizedUserEmail
    )

    if (store.userId !== userId && !emailMatch && !envMatch && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const auth = pusher.authenticate(socket_id, channel_name)
    return NextResponse.json(auth)
  } catch (err) {
    console.error('Pusher auth error', err)
    return NextResponse.json({ error: err.message || 'Auth failed' }, { status: 500 })
  }
}
