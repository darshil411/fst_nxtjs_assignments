// app/api/users/route.ts
// GET /api/users — returns the authenticated user's own profile only.
// Any signed-in role may call it; the response is always scoped to the session
// user, so it can never be used to read someone else's record.

import { NextResponse } from "next/server";
import { requireAuth, isAuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        _count: { select: { transactions: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    if (isAuthorizationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[API] GET /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
