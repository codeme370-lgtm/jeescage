import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/authHelpers"
import authAdmin from "@/middlewares/authAdmin"
import prisma from "@/lib/prisma"

export async function GET(request) {
  try {
    const userId = getSessionUserId(request)
    const isAdmin = await authAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all products with their order data
    const productsWithOrders = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        mrp: true,
        images: true,
        category: true,
        orderItems: {
          select: {
            quantity: true,
            price: true,
          },
        },
        rating: {
          select: {
            rating: true,
          },
        },
      },
    })

    // Calculate metrics for each product
    const productsWithMetrics = productsWithOrders.map((product) => {
      const totalQuantity = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
      const avgRating =
        product.rating.length > 0
          ? (product.rating.reduce((sum, r) => sum + r.rating, 0) / product.rating.length).toFixed(2)
          : 0
      const totalRatings = product.rating.length

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        image: product.images?.[0] || null,
        category: product.category,
        totalQuantity,
        totalRevenue,
        avgRating: parseFloat(avgRating),
        totalRatings,
      }
    })

    // Sort and get top/bottom 10 by quantity
    const byQuantity = productsWithMetrics.sort((a, b) => b.totalQuantity - a.totalQuantity)
    const topQuantity = byQuantity.slice(0, 10)
    const bottomQuantity = byQuantity.reverse().slice(0, 10)

    // Sort and get top/bottom 10 by revenue
    const byRevenue = productsWithMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue)
    const topRevenue = byRevenue.slice(0, 10)
    const bottomRevenue = byRevenue.reverse().slice(0, 10)

    // Sort and get top/bottom 10 by rating (only products with ratings)
    const productsWithRatings = productsWithMetrics.filter((p) => p.totalRatings > 0)
    const byRating = productsWithRatings.sort((a, b) => b.avgRating - a.avgRating)
    const topRating = byRating.slice(0, 10)
    const bottomRating = byRating.reverse().slice(0, 10)

    return NextResponse.json(
      {
        topQuantity,
        bottomQuantity,
        topRevenue,
        bottomRevenue,
        topRating,
        bottomRating,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 })
  }
}
