import { NextResponse } from "next/server";
import { getServerSession } from "@/auth";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const createLeadSchema = z.object({
  arAssessmentId: z.string().optional(),
  description: z.string().min(10),
  urgency: z.enum(["low", "medium", "high"]),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  homeownerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    propertyType: z.string().optional(),
  }),
  requiredSpecialties: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
  try {
    // Authenticate
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "homeowner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      arAssessmentId,
      description,
      urgency,
      budgetRange,
      timeline,
      homeownerInfo,
      requiredSpecialties,
    } = validation.data;

    const homeownerId = session.user.id;

    // Calculate lead price (you can adjust this logic)
    // Base price: $25, adjust based on urgency and specialties
    let leadPrice = 2500; // $25 in cents
    if (urgency === "high") leadPrice += 1000; // +$10 for urgent
    if (requiredSpecialties.length > 3) leadPrice += 500; // +$5 for multiple specialties

    // Create lead document in Firestore
    const leadRef = adminDb.collection("leads").doc();
    const leadId = leadRef.id;

    const leadData = {
      id: leadId,
      homeownerId,
      homeownerInfo,
      arAssessmentId: arAssessmentId || null,
      description,
      requiredSpecialties,
      urgency,
      budgetRange: budgetRange || null,
      timeline: timeline || null,
      status: "new",
      price: leadPrice,
      matchedContractorIds: [],
      purchasedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await leadRef.set(leadData);

    // Publish message to Pub/Sub topic (lead-created) for contractor matching
    // Note: This requires @google-cloud/pubsub package
    // For now, we'll rely on Firestore triggers in Cloud Functions
    
    // The Cloud Function should be set up with a Firestore trigger
    // that watches for new leads with status 'new' and triggers matching

    // Alternative: Update status to trigger Cloud Function
    await leadRef.update({
      status: "matching",
    });

    return NextResponse.json({ leadId }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

