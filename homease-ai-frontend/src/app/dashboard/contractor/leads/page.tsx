import { getServerSession } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { LeadCard } from "@/components/contractor/LeadCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function LeadMarketplacePage() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "contractor") {
    redirect("/auth/signin");
  }

  // Get contractor profile
  const userDoc = await adminDb.collection("users").doc(session.user.id).get();
  const userData = userDoc.data();
  const vettingStatus = userData?.contractorProfile?.vettingStatus;

  if (vettingStatus !== "approved") {
    redirect("/dashboard/contractor");
  }

  // Fetch all matched leads
  const leadsSnapshot = await adminDb
    .collection("leads")
    .where("matchedContractorIds", "array-contains", session.user.id)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const allLeads = leadsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString(),
  }));

  // Separate available and purchased leads
  const availableLeads = allLeads.filter(
    (lead: any) => !lead.purchasedBy?.includes(session.user.id) && lead.status === "matched"
  );
  const purchasedLeads = allLeads.filter((lead: any) =>
    lead.purchasedBy?.includes(session.user.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              HOMEase AI
            </Link>
            <span className="text-sm text-gray-600">Lead Marketplace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/contractor">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lead Marketplace
          </h1>
          <p className="text-gray-600">
            Browse and purchase qualified home modification leads matched to your expertise
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {availableLeads.length}
            </div>
            <div className="text-gray-600">Available Leads</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {purchasedLeads.length}
            </div>
            <div className="text-gray-600">Purchased Leads</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {userData?.contractorProfile?.serviceAreaZips?.length || 0}
            </div>
            <div className="text-gray-600">Service Area ZIP Codes</div>
          </Card>
        </div>

        {/* Available Leads Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Leads ({availableLeads.length})
            </h2>
            {/* Future: Add filters here */}
          </div>

          {availableLeads.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableLeads.map((lead: any) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  contractorId={session.user.id}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Available Leads
              </h3>
              <p className="text-gray-600 mb-4">
                There are no new leads matching your service area and specialties at the moment.
              </p>
              <p className="text-sm text-gray-500">
                Check back soon or update your profile to receive more matches.
              </p>
            </Card>
          )}
        </div>

        {/* Purchased Leads Section */}
        {purchasedLeads.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Purchased Leads ({purchasedLeads.length})
            </h2>
            <div className="space-y-4">
              {purchasedLeads.map((lead: any) => (
                <Card key={lead.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {lead.homeownerInfo?.city}, {lead.homeownerInfo?.state} {lead.homeownerInfo?.zip}
                      </h3>
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {lead.description}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Budget:</strong> {lead.budgetRange || "Not specified"}
                        </span>
                        <span>
                          <strong>Urgency:</strong> {lead.urgency}
                        </span>
                        <span>
                          <strong>Purchased:</strong>{" "}
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link href={`/dashboard/contractor/leads/${lead.id}`}>
                      <Button variant="outline">View Full Details</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

