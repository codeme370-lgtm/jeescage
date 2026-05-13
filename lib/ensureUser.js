import prisma from "./prisma";

export default async function ensureUser(userId) {
  if (!userId) return null;

  try {
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch (err) {
    console.error("ensureUser error:", err);
    return null;
  }
}
