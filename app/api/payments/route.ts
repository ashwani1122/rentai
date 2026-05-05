// app/api/payments/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: { rental: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payment = await prisma.payment.create({
      data: {
        rentalId: body.rentalId,
        amount: body.amount,
        stripePaymentIntentId: body.stripePaymentIntentId,
        status: body.status,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}