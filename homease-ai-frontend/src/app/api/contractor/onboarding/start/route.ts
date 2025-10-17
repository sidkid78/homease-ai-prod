import { NextResponse } from "next/server";
import { getServerSession } from "@/auth";
import { adminDb } from "@/lib/firebase/admin";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

export async function POST() {
  try {
    // 1. Authenticate and authorize
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "contractor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

    // 2. Check if contractor already has a Stripe account
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    let stripeAccountId = userData?.contractorProfile?.stripeAccountId;

    // 3. Create Stripe Connect account if it doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: session.user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
      });

      stripeAccountId = account.id;

      // Save to Firestore
      await userRef.update({
        "contractorProfile.stripeAccountId": stripeAccountId,
        "contractorProfile.vettingStatus": "pending_stripe",
        updatedAt: new Date(),
      });
    }

    // 4. Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/contractor?onboarding=refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/contractor?onboarding=complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to start onboarding" },
      { status: 500 }
    );
  }
}

