import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import  prisma  from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth";
// import { writeRateLimit } from "@/lib/ratelimit";
import { encryptSecret } from "@/lib/crypto";
import { AIProvider } from "@/app/generated/prisma/client";
import { writeRateLimit } from "@/lib/ratelimit/route";
// import { AIProvider } from "../../../../app/generated/prisma";

const schema = z.object({
  provider: z.nativeEnum(AIProvider),
  rawKey: z.string().min(20),
  keyLabel: z.string().max(80).optional(),
  balance: z.number().int().nullable().optional(),
  pricePerHour: z.coerce.number().positive(),
  maxDurationHours: z.coerce.number().int().min(1).max(168).default(24),
  expiresAt: z.string().datetime().optional(),
});

export async function GET() {
  const authResult = await requireDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error!.message },
      { status: authResult.error!.status }
    );
  }

  const tokens = await prisma.sellerToken.findMany({
    where: { userId: authResult.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tokens);
}

export async function POST(request: NextRequest) {
  const authResult = await requireDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error!.message },
      { status: authResult.error!.status }
    );
  }

  const ip = request.headers.get("x-forwarded-for") ?? authResult.user.id;
  const { success } = await writeRateLimit.limit(`seller-token:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const token = await prisma.sellerToken.create({
    data: {
      userId: authResult.user.id,
      provider: parsed.data.provider,
      encryptedKey: encryptSecret(parsed.data.rawKey),
      keyLabel: parsed.data.keyLabel,
      balance: parsed.data.balance ?? null,
      pricePerHour: parsed.data.pricePerHour,
      maxDurationHours: parsed.data.maxDurationHours,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  return NextResponse.json(token, { status: 201 });
}