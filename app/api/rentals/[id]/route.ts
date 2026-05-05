import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import  prisma  from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth";
import { RentalStatus } from "@/app/generated/prisma/enums";
// import { RentalStatus } from "../../../../../app/generated/prisma";

const patchSchema = z.object({
  status: z.nativeEnum(RentalStatus).optional(),
});

export async function GET(
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
  const rental = await prisma.rental.findUnique({
    where: { id },
    include: {
      buyer: true,
      seller: true,
      sellerToken: true,
      payments: true,
      accessTokens: true,
      usageLogs: { orderBy: { createdAt: "desc" }, take: 100 },
      payout: true,
    },
  });

  if (!rental) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  if (rental.buyerId !== authResult.user.id && rental.sellerUserId !== authResult.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(rental);
}

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
  const existing = await prisma.rental.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  if (existing.buyerId !== authResult.user.id && existing.sellerUserId !== authResult.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.rental.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}