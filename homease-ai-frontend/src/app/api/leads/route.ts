import { NextResponse } from "next/server";
import { getServerSession } from "@/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userRole = session.user.role;
    const userId = session.user.id;

    let query = adminDb.collection("leads");

    // Filter based on user role
    if (userRole === "contractor") {
      // Contractors see leads they're matched with or have purchased
      const filter = searchParams.get("filter");
      
      if (filter === "purchased") {
        query = query.where("purchasedBy", "array-contains", userId) as any;
      } else if (filter === "available") {
        // Get contractor's profile to check service areas
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const userData = userDoc.data();
        
        if (userData?.contractorProfile?.vettingStatus !== "approved") {
          return NextResponse.json({ 
            error: "Complete onboarding to view leads" 
          }, { status: 403 });
        }

        // Only show matched leads that haven't been purchased
        query = query
          .where("matchedContractorIds", "array-contains", userId)
          .where("status", "==", "matched") as any;
      } else {
        // All leads for this contractor
        query = query.where("matchedContractorIds", "array-contains", userId) as any;
      }
    } else if (userRole === "homeowner") {
      // Homeowners only see their own leads
      query = query.where("homeownerId", "==", userId) as any;
    } else if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Execute query
    const snapshot = await query.orderBy("createdAt", "desc").limit(50).get();
    
    const leads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

