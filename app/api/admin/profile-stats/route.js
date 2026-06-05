import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/authHelpers'
import authAdmin from '@/middlewares/authAdmin'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const userId = getSessionUserId(request)
    const isAdmin = await authAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 })
    }

    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      totalCoupons,
      totalStores,
      totalReviews,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.coupon.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ])

    return NextResponse.json(
      {
        stats: {
          totalOrders,
          totalProducts,
          totalCustomers,
          totalCoupons,
          totalStores,
          totalReviews,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to fetch profile stats' }, { status: 500 })
  }
}
