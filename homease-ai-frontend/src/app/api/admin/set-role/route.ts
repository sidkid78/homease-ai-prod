import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['homeowner', 'contractor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be homeowner, contractor, or admin' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await adminAuth.getUserByEmail(email);

    // Set custom claims
    await adminAuth.setCustomUserClaims(user.uid, { role });

    // Update Firestore document
    await adminDb.collection('users').doc(user.uid).update({
      role,
      updatedAt: new Date(),
    });

    // Clean up pending role assignment if it exists
    try {
      await adminDb.collection('pending-role-assignments').doc(user.uid).delete();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error('Error deleting pending role assignment:', errorMessage);
    }

    return NextResponse.json({ success: true, message: `Role set to '${role}' for ${email}`, uid: user.uid });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Set role error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}