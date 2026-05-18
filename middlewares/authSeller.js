import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";

// Let's find the user's seller store via a Prisma query.
const authSeller = async (userId) => {
  try {
    if (!userId) {
      console.warn('authSeller called without userId')
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    })

    console.log('authSeller: lookup userId=', userId, 'foundUser=', !!user)
    if (user) console.log('authSeller: user.store=', !!user.store, 'storeStatus=', user.store?.status)

    if (!user) {
      return false
    }

    const email = user.email?.toLowerCase() || ''
    const isAdmin = await authAdmin(userId)

    // If the user owns an approved store, return its store id.
    if (user.store && user.store.status === 'approved') {
      return user.store.id
    }

    // If the user is an admin email, allow store access for any matching store or the first available store.
    if (isAdmin) {
      let adminStore = null

      if (email) {
        adminStore = await prisma.store.findFirst({
          where: {
            OR: [
              { user: { email } },
              { email },
            ],
          },
          orderBy: { createdAt: 'asc' },
        })
      }

      if (!adminStore) {
        adminStore = await prisma.store.findFirst({
          orderBy: { createdAt: 'asc' },
        })
      }

      if (adminStore) {
        console.log('authSeller: admin bypass granted storeId=', adminStore.id, 'for user.email=', user.email)
        return adminStore.id
      }
    }

    // If the user doesn't have a linked store, allow access if the email matches any approved store.
    if (email) {
      const storeByEmail = await prisma.store.findFirst({
        where: {
          status: 'approved',
          OR: [
            { user: { email } },
            { email },
          ],
        },
      })

      if (storeByEmail) {
        console.log('authSeller: matched store by email for user.email=', user.email)
        return storeByEmail.id
      }
    }

    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

export default authSeller;
