import prisma from '@/lib/prisma'
import { PaymentMethod } from '@prisma/client'

function toCartObject(cart) {
  return cart && typeof cart === 'object' && !Array.isArray(cart) ? cart : {}
}

export async function savePendingCheckout(userId, pendingCheckout) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cart: true },
  })

  const currentCart = toCartObject(user?.cart)
  const nextCart = { ...currentCart, pendingCheckout }

  await prisma.user.update({
    where: { id: userId },
    data: { cart: nextCart },
  })

  return nextCart
}

export async function abandonPendingCheckout(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cart: true },
  })

  const currentCart = toCartObject(user?.cart)
  const { pendingCheckout, ...rest } = currentCart

  await prisma.user.update({
    where: { id: userId },
    data: { cart: rest },
  })

  return rest
}

export async function clearCheckoutCart(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cart: true },
  })

  const currentCart = toCartObject(user?.cart)
  const { pendingCheckout, items, ...rest } = currentCart

  await prisma.user.update({
    where: { id: userId },
    data: { cart: rest },
  })

  return rest
}

export async function createOrdersFromPendingCheckout({
  userId,
  reference,
  paymentMethod = PaymentMethod.PAYSTACK,
  paymentStatus = 'PENDING',
  status = 'PROCESSING',
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cart: true },
  })

  const pendingCheckout = toCartObject(user?.cart).pendingCheckout
  if (!pendingCheckout) {
    return { createdOrderIds: [], skipped: true }
  }

  const orderDrafts = Array.isArray(pendingCheckout.orderDrafts) ? pendingCheckout.orderDrafts : []
  if (!orderDrafts.length) {
    return { createdOrderIds: [], skipped: true }
  }

  const createdOrderIds = []
  const addressId = pendingCheckout.addressId
  const coupon = pendingCheckout.coupon || {}

  for (const draft of orderDrafts) {
    const newOrder = await prisma.order.create({
      data: {
        userId,
        storeId: draft.storeId,
        addressId,
        paymentMethod,
        total: parseFloat(Number(draft.orderAmount || 0).toFixed(2)),
        isCouponUsed: Boolean(pendingCheckout.couponCode),
        coupon,
        status,
        paymentStatus,
        isPaid: true,
        paystackReference: reference,
        orderItems: {
          create: (draft.orderItems || []).map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor || null,
          })),
        },
      },
    })

    createdOrderIds.push(newOrder.id)

    for (const item of draft.orderItems || []) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { quantity: true },
      })

      if (!product) continue

      const newQuantity = product.quantity - item.quantity
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: newQuantity,
          inStock: newQuantity > 0,
        },
      })
    }
  }

  await clearCheckoutCart(userId)

  return { createdOrderIds, skipped: false }
}
