import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth";
import { createPolarCheckout } from "@/lib/polar";

export async function POST(request: NextRequest) {
  const authResult = await requireDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error!.message },
      { status: authResult.error!.status }
    );
  }

  const body = await request.json();
  const rentalId = body.rentalId as string | undefined;
  const productId = body.productId as string | undefined;

  if (!rentalId || !productId) {
    return NextResponse.json(
      { error: "rentalId and productId are required" },
      { status: 400 }
    );
  }

  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { buyer: true, sellerToken: true },
  });

  if (!rental) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  if (rental.buyerId !== authResult.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const checkout = await createPolarCheckout({
    productIds: [productId],
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/rentals/${rental.id}?paid=1`,
    customerEmail: rental.buyer.email,
    metadata: {
      rentalId: rental.id,
      buyerId: rental.buyerId,
      sellerUserId: rental.sellerUserId,
    },
  });

  await prisma.payment.create({
    data: {
      rentalId: rental.id,
      amount: rental.totalAmount,
      polarCheckoutId: checkout.id,
    },
  });

  return NextResponse.json({
    checkoutId: checkout.id,
    checkoutUrl: checkout.url,
  });
}