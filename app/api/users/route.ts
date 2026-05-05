// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        clerkId: body.clerkId,
        email: body.email,
        name: body.name,
        stripeAccountId: body.stripeAccountId,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}