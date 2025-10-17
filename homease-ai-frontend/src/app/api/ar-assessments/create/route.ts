import { NextResponse } from "next/server";
import { getServerSession } from "@/auth";
import { adminDb } from "@/lib/firebase/admin";
import { RoomType } from "@/types";
import { z } from "zod";

const createAssessmentSchema = z.object({
  room: z.enum([
    "bathroom",
    "bedroom",
    "kitchen",
    "living-room",
    "hallway",
    "stairs",
    "entrance",
    "other",
  ]),
  description: z.string().optional(),
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
    const validation = createAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { room, description } = validation.data;
    const userId = session.user.id;

    // Create assessment document in Firestore
    const assessmentRef = adminDb.collection("ar-assessments").doc();
    const assessmentId = assessmentRef.id;

    await assessmentRef.set({
      id: assessmentId,
      userId,
      room,
      description: description || "",
      status: "uploading",
      rawDataUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ assessmentId }, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

