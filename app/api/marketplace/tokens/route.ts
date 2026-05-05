import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { publicRateLimit } from "@/lib/ratelimit/route";
// import { publicRateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await publicRateLimit.limit(`marketplace:${ip}`);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const now = new Date();
  const tokens = await prisma.sellerToken.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: {
      id: true,
      provider: true,
      keyLabel: true,
      balance: true,
      pricePerHour: true,
      maxDurationHours: true,
      expiresAt: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tokens);
}