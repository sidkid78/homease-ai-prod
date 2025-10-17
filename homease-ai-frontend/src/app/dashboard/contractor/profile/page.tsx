import { getServerSession } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function ContractorProfilePage() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "contractor") {
    redirect("/auth/signin");
  }

  // Fetch contractor profile
  const userDoc = await adminDb.collection("users").doc(session.user.id).get();
  const userData = userDoc.data();
  const profile = userData?.contractorProfile || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              HOMEase AI
            </Link>
            <span className="text-sm text-gray-600">My Profile</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/contractor">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Contractor Profile
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your business information and credentials
        </p>

        {/* Business Information */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Business Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Company Name
              </label>
              <p className="text-gray-900">
                {profile.companyName || "Not provided"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                License Number
              </label>
              <p className="text-gray-900">
                {profile.licenseNumber || "Not provided"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Bio
              </label>
              <p className="text-gray-900">
                {profile.bio || "No bio added yet"}
              </p>
            </div>
          </div>

          <Button className="mt-6">Edit Business Information</Button>
        </Card>

        {/* Specialties */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Specialties
          </h2>

          {profile.specialties && profile.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.specialties.map((specialty: string) => (
                <span
                  key={specialty}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mb-6">No specialties added yet</p>
          )}

          <Button>Manage Specialties</Button>
        </Card>

        {/* Service Area */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Service Area
          </h2>

          {profile.serviceAreaZips && profile.serviceAreaZips.length > 0 ? (
            <>
              <p className="text-gray-600 mb-4">
                You currently serve {profile.serviceAreaZips.length} ZIP code(s)
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.serviceAreaZips.slice(0, 10).map((zip: string) => (
                  <span
                    key={zip}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded"
                  >
                    {zip}
                  </span>
                ))}
                {profile.serviceAreaZips.length > 10 && (
                  <span className="px-3 py-1 text-gray-600">
                    +{profile.serviceAreaZips.length - 10} more
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-600 mb-6">No service areas added yet</p>
          )}

          <Button>Manage Service Area</Button>
        </Card>

        {/* Certifications */}
        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Certifications & Verification
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">
                  Insurance Verification
                </div>
                <div className="text-sm text-gray-600">
                  Proof of liability insurance
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  profile.insuranceVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {profile.insuranceVerified ? "✓ Verified" : "Pending"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">
                  CAPS Certification
                </div>
                <div className="text-sm text-gray-600">
                  Certified Aging-in-Place Specialist
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  profile.capsCertified
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {profile.capsCertified ? "✓ Certified" : "Not Certified"}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">
                  Stripe Account Status
                </div>
                <div className="text-sm text-gray-600">
                  Payment processing verification
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  profile.vettingStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : profile.vettingStatus === "pending_stripe"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {profile.vettingStatus === "approved"
                  ? "✓ Verified"
                  : profile.vettingStatus === "pending_stripe"
                  ? "⏳ In Progress"
                  : "Not Started"}
              </span>
            </div>
          </div>
        </Card>

        {/* Performance */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Performance
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {profile.averageRating?.toFixed(1) || "N/A"}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>

            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {profile.reviewCount || 0}
              </div>
              <div className="text-gray-600">Total Reviews</div>
            </div>
          </div>

          <Button className="mt-6" variant="outline">
            View All Reviews
          </Button>
        </Card>
      </main>
    </div>
  );
}

