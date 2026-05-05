import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma  from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth";
import { writeRateLimit } from "@/lib/ratelimit/route";
import { RentalStatus } from "@/app/generated/prisma/enums";
// import { writeRateLimit } from "@/lib/ratelimit";
// import { RentalStatus } from "../../../../app/generated/prisma";

const createSchema = z.object({
  sellerTokenId: z.string().min(10),
  hours: z.coerce.number().int().min(1).max(168),
});

export async function GET() {
  const authResult = await requireDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult?.error!.message },
      { status: authResult?.error!.status }
    );
  }

  const rentals = await prisma.rental.findMany({
    where: {
      OR: [{ buyerId: authResult.user.id }, { sellerUserId: authResult.user.id }],
    },
    include: {
      buyer: true,
      seller: true,
      sellerToken: true,
      payments: true,
      payout: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rentals);
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
  const { success } = await writeRateLimit.limit(`rental:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sellerToken = await prisma.sellerToken.findUnique({
    where: { id: parsed.data.sellerTokenId },
  });

  if (!sellerToken || !sellerToken.isActive) {
    return NextResponse.json({ error: "Token is not available" }, { status: 404 });
  }

  if (sellerToken.userId === authResult.user.id) {
    return NextResponse.json({ error: "Cannot rent your own token" }, { status: 400 });
  }

  if (parsed.data.hours > sellerToken.maxDurationHours) {
    return NextResponse.json(
      { error: "Requested duration exceeds maxDurationHours" },
      { status: 400 }
    );
  }

  const totalAmount = Number(sellerToken.pricePerHour) * parsed.data.hours;
  const platformFee = Number((totalAmount * 0.2).toFixed(2));
  const sellerAmount = Number((totalAmount - platformFee).toFixed(2));
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + parsed.data.hours * 60 * 60 * 1000);

  const rental = await prisma.rental.create({
    data: {
      buyerId: authResult.user.id,
      sellerTokenId: sellerToken.id,
      sellerUserId: sellerToken.userId,
      startTime,
      endTime,
      totalAmount,
      platformFee,
      sellerAmount,
      status: RentalStatus.PENDING_PAYMENT,
    },
  });

  return NextResponse.json(rental, { status: 201 });
}