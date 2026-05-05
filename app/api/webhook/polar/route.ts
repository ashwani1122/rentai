import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { generateAccessToken, sha256 } from "@/lib/proxy-token";
import { verifyPolarWebhook } from "@/lib/polar";
import { PaymentStatus, PayoutStatus, RentalStatus } from "@/app/generated/prisma/client";
// import { PaymentStatus, PayoutStatus, RentalStatus } from "../../../../../app/generated/prisma";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let event: any;
  try {
    event = verifyPolarWebhook(rawBody, request.headers);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (event.type === "order.paid") {
    const rentalId = event.data?.metadata?.rentalId as string | undefined;
    if (!rentalId) return NextResponse.json({ received: true });

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { payments: true },
    });

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    const rawAccessToken = generateAccessToken();
    const tokenHash = sha256(rawAccessToken);

    await prisma.$transaction(async (tx) => {
      await tx.rental.update({
        where: { id: rental.id },
        data: { status: RentalStatus.ACTIVE, proxyTokenHash: tokenHash },
      });

      const existingPayment = rental.payments[0];
      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: PaymentStatus.SUCCEEDED,
            polarOrderId: event.data.id,
            externalPaymentId: event.data.id,
          },
        });
      }

      await tx.rentalAccessToken.create({
        data: {
          rentalId: rental.id,
          tokenHash,
          expiresAt: rental.endTime,
        },
      });

      await tx.payout.upsert({
        where: { rentalId: rental.id },
        update: {
          amount: rental.sellerAmount,
          platformFee: rental.platformFee,
          status: PayoutStatus.PENDING,
        },
        create: {
          rentalId: rental.id,
          sellerId: rental.sellerUserId,
          amount: rental.sellerAmount,
          platformFee: rental.platformFee,
          status: PayoutStatus.PENDING,
        },
      });
    });

    return NextResponse.json({
      received: true,
      rentalId,
      accessTokenPreview: rawAccessToken.slice(0, 8),
    });
  }

  if (event.type === "order.refunded") {
    const rentalId = event.data?.metadata?.rentalId as string | undefined;
    if (rentalId) {
      await prisma.$transaction(async (tx) => {
        await tx.rental.update({
          where: { id: rentalId },
          data: { status: RentalStatus.CANCELLED },
        });

        await tx.payment.updateMany({
          where: { rentalId },
          data: { status: PaymentStatus.REFUNDED },
        });

        await tx.rentalAccessToken.updateMany({
          where: { rentalId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      });
    }
  }

  return NextResponse.json({ received: true });
}