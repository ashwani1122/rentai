import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import  prisma  from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth";

const patchSchema = z.object({
  keyLabel: z.string().max(80).optional(),
  balance: z.number().int().nullable().optional(),
  pricePerHour: z.coerce.number().positive().optional(),
  maxDurationHours: z.coerce.number().int().min(1).max(168).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error!.message },
      { status: authResult.error!.status }
    );
  }

  const { id } = await params;
  const existing = await prisma.sellerToken.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Seller token not found" }, { status: 404 });
  }
  if (existing.userId !== authResult.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.sellerToken.update({
    where: { id },
    data: {
      keyLabel: parsed.data.keyLabel,
      balance: parsed.data.balance,
      pricePerHour: parsed.data.pricePerHour,
      maxDurationHours: parsed.data.maxDurationHours,
      isActive: parsed.data.isActive,
      expiresAt:
        parsed.data.expiresAt === undefined
          ? undefined
          : parsed.data.expiresAt
            ? new Date(parsed.data.expiresAt)
            : null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error!.message },
      { status: authResult.error!.status }
    );
  }

  const { id } = await params;
  const existing = await prisma.sellerToken.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Seller token not found" }, { status: 404 });
  }
  if (existing.userId !== authResult.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.sellerToken.delete({ where: { id } });
  return NextResponse.json({ success: true });
}