import { NextResponse } from "next/server";
import { getServerSession } from "@/auth";
import { adminDb } from "@/lib/firebase/admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

export async function POST(
    { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "contractor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contractorId = session.user.id;
    const leadId = params.leadId;

    // 1. Get lead details
    const leadRef = adminDb.collection("leads").doc(leadId);
    const leadDoc = await leadRef.get();

    if (!leadDoc.exists) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const leadData = leadDoc.data()!;

    // 2. Check if contractor is matched with this lead
    if (!leadData.matchedContractorIds?.includes(contractorId)) {
      return NextResponse.json(
        { error: "You are not matched with this lead" },
        { status: 403 }
      );
    }

    // 3. Check if lead is already purchased by this contractor
    if (leadData.purchasedBy?.includes(contractorId)) {
      return NextResponse.json(
        { error: "You have already purchased this lead" },
        { status: 400 }
      );
    }

    // 4. Get contractor profile to verify approval status
    const contractorDoc = await adminDb.collection("users").doc(contractorId).get();
    const contractorData = contractorDoc.data();

    if (contractorData?.contractorProfile?.vettingStatus !== "approved") {
      return NextResponse.json(
        { error: "Complete your profile verification to purchase leads" },
        { status: 403 }
      );
    }

    // 5. Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lead: ${leadData.homeownerInfo?.displayName || "Homeowner"}`,
              description: leadData.description?.substring(0, 100) || "Home modification lead",
            },
            unit_amount: leadData.price || 2500, // Default $25.00 if not set
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/contractor/leads/${leadId}?purchase=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/contractor/leads/${leadId}?purchase=cancelled`,
      metadata: {
        leadId,
        contractorId,
        type: "lead_purchase",
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error("Lead purchase error:", error);
    return NextResponse.json(
      { error: "Failed to initiate purchase" },
      { status: 500 }
    );
  }
}

