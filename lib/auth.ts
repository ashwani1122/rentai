import { auth } from "@clerk/nextjs/server";
import  prisma  from "@/lib/prisma";

export async function requireDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return { error: { message: "Unauthorized", status: 401 } } as const;
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    return { error: { message: "User not found", status: 404 } } as const;
  }

  return { user } as const;
}