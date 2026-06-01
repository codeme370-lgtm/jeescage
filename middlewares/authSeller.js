import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";

// Find the user's seller store primarily by email.
const authSeller = async (userId) => {
  try {
    if (!userId) {
      console.warn('authSeller called without userId')
      return false
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      console.warn('authSeller: user not found for userId=', userId)
      return false
    }

    const email = user.email?.toLowerCase().trim()
    const isAdmin = await authAdmin(userId)

    // Prefer matching any store by the user's email on the store record or the joined user.
    if (email) {
      const storeByEmail = await prisma.store.findFirst({
        where: {
          OR: [
            {
              user: {
                email: {
                  equals: email,
                  mode: 'insensitive',
                },
              },
            },
            {
              email: {
                equals: email,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: { createdAt: 'asc' },
      })

      if (storeByEmail) {
        console.log('authSeller: matched store by email for user.email=', email)
        return storeByEmail.id
      }
    }


    // Fallback: if the user has any linked store, return it.
    const linkedStore = await prisma.store.findUnique({ where: { userId } })
    if (linkedStore) {
      console.log('authSeller: matched linked store for userId=', userId)
      return linkedStore.id
    }

    // Admins may access any available store.
    if (isAdmin) {
      const adminStore = await prisma.store.findFirst({
        orderBy: { createdAt: 'asc' },
      })
      if (adminStore) {
        console.log('authSeller: admin bypass granted storeId=', adminStore.id, 'for user.email=', email)
        return adminStore.id
      }
    }

    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

export default authSeller;
