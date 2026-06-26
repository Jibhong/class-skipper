// app/api/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getFirestoreDB } from "@/lib/server/server.firebaseInterface";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const db = getFirestoreDB();

    const userDoc = await db.collection("users").doc(username).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const authDoc = await db
      .collection("users")
      .doc(username)
      .collection("protected")
      .doc("auth")
      .get();

    if (!authDoc.exists) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    const user = userDoc.data()!;
    const auth = authDoc.data()!;

    const valid = await bcrypt.compare(password, auth.password);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
