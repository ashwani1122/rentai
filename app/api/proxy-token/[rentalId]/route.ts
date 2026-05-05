import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth";
import { generateAccessToken, sha256 } from "@/lib/proxy-token";
import { RentalStatus } from "@/app/generated/prisma/client";
// import { RentalStatus } from "../../../../../app/generated/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ rentalId: string }> }
) {
  const authResult = await requireDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error!.message },
      { status: authResult.error!.status }
    );
  }

  const { rentalId } = await params;
  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });

  if (!rental) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  if (rental.buyerId !== authResult.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (rental.status !== RentalStatus.ACTIVE) {
    return NextResponse.json({ error: "Rental is not active" }, { status: 400 });
  }

  if (rental.endTime.getTime() < Date.now()) {
    return NextResponse.json({ error: "Rental expired" }, { status: 400 });
  }

  const raw = generateAccessToken();
  const hash = sha256(raw);

  await prisma.$transaction(async (tx) => {
    await tx.rental.update({
      where: { id: rentalId },
      data: { proxyTokenHash: hash },
    });

    await tx.rentalAccessToken.create({
      data: { rentalId, tokenHash: hash, expiresAt: rental.endTime },
    });
  });

  return NextResponse.json({ accessToken: raw, expiresAt: rental.endTime });
}