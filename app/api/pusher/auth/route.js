import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server"
import pusher from "@/lib/pusher"
import prisma from "@/lib/prisma"

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
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store || store.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const auth = pusher.authenticate(socket_id, channel_name)
    return NextResponse.json(auth)
  } catch (err) {
    console.error('Pusher auth error', err)
    return NextResponse.json({ error: err.message || 'Auth failed' }, { status: 500 })
  }
}
