import { NextResponse } from "next/server";
import { getServerSession } from "@/auth";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const processAssessmentSchema = z.object({
  assessmentId: z.string(),
  imageUrls: z.array(z.string()).min(1),
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
    const validation = processAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { assessmentId, imageUrls } = validation.data;
    const userId = session.user.id;

    // Verify the assessment exists and belongs to the user
    const assessmentRef = adminDb.collection("ar-assessments").doc(assessmentId);
    const assessmentDoc = await assessmentRef.get();

    if (!assessmentDoc.exists) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessmentData = assessmentDoc.data();
    if (assessmentData?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update assessment with image URLs and change status to processing
    await assessmentRef.update({
      rawDataUrls: imageUrls,
      status: "processing",
      updatedAt: new Date(),
    });

    // Publish message to Pub/Sub topic (ar-assessment-created)
    // Note: This requires @google-cloud/pubsub package
    // For now, we'll trigger the Cloud Function via HTTP or use Firestore triggers
    
    // Alternative: If using Firestore triggers, the Cloud Function will automatically
    // be triggered when we update the status to 'processing'
    
    // If you have Pub/Sub set up, use this:
    /*
    const { PubSub } = require('@google-cloud/pubsub');
    const pubsub = new PubSub();
    const topic = pubsub.topic('ar-assessment-created');
    
    await topic.publishMessage({
      json: {
        assessmentId,
        userId,
      },
    });
    */

    // For now, the Cloud Function should be set up with a Firestore trigger
    // that watches for ar-assessments where status changes to 'processing'

    return NextResponse.json(
      { 
        message: "Assessment processing started",
        assessmentId 
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error processing assessment:", error);
    return NextResponse.json(
      { error: "Failed to start assessment processing" },
      { status: 500 }
    );
  }
}

