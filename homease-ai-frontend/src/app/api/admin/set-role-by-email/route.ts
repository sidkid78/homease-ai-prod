import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["homeowner", "contractor", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be: homeowner, contractor, or admin" },
        { status: 400 }
      );
    }

    // Get user by email
    const userRecord = await adminAuth.getUserByEmail(email);

    // Set custom claim
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // Also update Firestore document
    await adminDb.collection("users").doc(userRecord.uid).set(
      {
        role,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`✅ Role '${role}' set for user: ${email} (${userRecord.uid})`);

    return NextResponse.json({
      success: true,
      message: `Role '${role}' set for ${email}`,
      userId: userRecord.uid,
    });
  } catch (error: any) {
    console.error("Error setting role:", error);
    
    if (error.code === "auth/user-not-found") {
      return NextResponse.json(
        { error: "User not found with that email" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to set role" },
      { status: 500 }
    );
  }
}

