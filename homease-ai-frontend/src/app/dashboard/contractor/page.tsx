import { getServerSession } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { OnboardingBanner } from "@/components/contractor/OnboardingBanner";
import { LeadCard } from "@/components/contractor/LeadCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lead } from "@/types";

export default async function ContractorDashboard() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'contractor' && session.user.role !== 'admin') {
    redirect('/');
  }

  // Fetch contractor profile
  const userDoc = await adminDb.collection("users").doc(session.user.id).get();
  const userData = userDoc.data();
  const contractorProfile = userData?.contractorProfile || {};
  const vettingStatus = contractorProfile.vettingStatus || null;

  // Fetch leads if contractor is approved
  let availableLeads: any[] = [];
  let purchasedLeads: any[] = [];
  
  if (vettingStatus === "approved") {
    try {
      // Get available leads (matched but not purchased)
      const availableSnapshot = await adminDb
        .collection("leads")
        .where("matchedContractorIds", "array-contains", session.user.id)
        .where("status", "==", "matched")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

      availableLeads = availableSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
        }))
        .filter((lead: any) => !lead.purchasedBy?.includes(session.user.id));

      // Get purchased leads
      const purchasedSnapshot = await adminDb
        .collection("leads")
        .where("purchasedBy", "array-contains", session.user.id)
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

      purchasedLeads = purchasedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  }

  // Calculate stats
  const stats = {
    newLeads: availableLeads.length,
    activeProjects: purchasedLeads.filter((l: any) => l.status === "matched" || l.status === "in_progress").length,
    completed: purchasedLeads.filter((l: any) => l.status === "completed").length,
    reviews: contractorProfile.reviewCount || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              HOMEase AI
            </Link>
            <span className="text-sm text-gray-600">Contractor Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/contractor/profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
            <span className="text-sm text-gray-700">
              {session.user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <Button
                type="submit"
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Onboarding Banner */}
        <OnboardingBanner vettingStatus={vettingStatus} />

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userData?.displayName || session.user.email}!
          </h1>
          <p className="text-gray-600">
            {vettingStatus === "approved" 
              ? "Manage your leads and grow your accessibility business"
              : "Complete your profile to start receiving qualified leads"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.newLeads}</div>
            <div className="text-gray-600">New Leads</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeProjects}</div>
            <div className="text-gray-600">Active Projects</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.completed}</div>
            <div className="text-gray-600">Completed</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.reviews}</div>
            <div className="text-gray-600">Reviews</div>
            {contractorProfile.averageRating && (
              <div className="text-sm text-gray-500 mt-1">
                ⭐ {contractorProfile.averageRating.toFixed(1)} avg
              </div>
            )}
          </Card>
        </div>

        {vettingStatus === "approved" ? (
          <>
            {/* Available Leads */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Available Leads</h2>
                <Link href="/dashboard/contractor/leads">
                  <Button variant="outline">View All</Button>
                </Link>
              </div>
              
              {availableLeads.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {availableLeads.slice(0, 4).map((lead: any) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      contractorId={session.user.id}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-lg text-gray-500 mb-2">No new leads available</p>
                  <p className="text-sm text-gray-400">
                    Check back soon for qualified projects in your area
                  </p>
                </Card>
              )}
            </div>

            {/* Active Projects */}
            {purchasedLeads.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Your Active Leads</h2>
                <Card className="p-6">
                  <div className="space-y-4">
                    {purchasedLeads.map((lead: Lead) => (
                      <div
                        key={lead.id}
                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {lead.homeownerName}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {lead.description}
                            {lead.address.city}, {lead.address.state}
                          </p>
                        </div>
                        <Link href={`/dashboard/contractor/leads/${lead.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </>
        ) : (
          /* Quick Actions for Non-Approved Contractors */
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow opacity-50">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lead Marketplace</h3>
              <p className="text-gray-600 mb-4">
                Browse and purchase qualified leads in your area
              </p>
              <Button disabled className="w-full">
                Complete Onboarding First
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">My Profile</h3>
              <p className="text-gray-600 mb-4">
                Manage your business profile and credentials
              </p>
              <Link href="/dashboard/contractor/profile">
                <Button className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow opacity-50">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Messages</h3>
              <p className="text-gray-600 mb-4">
                Chat with homeowners and manage inquiries
              </p>
              <Button disabled className="w-full">
                Complete Onboarding First
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
