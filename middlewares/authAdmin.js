import prisma from "@/lib/prisma"

const authAdmin = async (userId) => {
  try {
    if (!userId) return false;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const raw = process.env.ADMIN_EMAIL || '';
    const list = raw.replace(/['"]/g, '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const userEmail = (user.email || '').toLowerCase();
    return list.includes(userEmail);
  } catch (error) {
    console.error(error);
    return false;
  }
};

export default authAdmin;