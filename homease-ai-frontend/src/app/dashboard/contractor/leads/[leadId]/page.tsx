import { getServerSession } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Hazard, Lead, Recommendation } from "@/types";
import Image from "next/image";

export default async function LeadDetailsPage({
  params,
}: {
  params: { leadId: string };
}) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "contractor") {
    redirect("/auth/signin");
  }

  // Fetch lead details
  const leadDoc = await adminDb.collection("leads").doc(params.leadId).get();

  if (!leadDoc.exists) {
    notFound();
  }

  const lead = leadDoc.data() as Lead;

  // Check if contractor has access to this lead
  const isPurchased = lead.purchasedBy?.includes(session.user.id);
  const isMatched = lead.matchedContractorIds?.includes(session.user.id);

  if (!isPurchased && !isMatched) {
    redirect("/dashboard/contractor/leads");
  }

  // Fetch AR assessment if available
  let arAssessment = null;
  if (isPurchased && lead.arAssessmentId) {
    const assessmentDoc = await adminDb
      .collection("ar-assessments")
      .doc(lead.arAssessmentId)
      .get();
    
    if (assessmentDoc.exists) {
      arAssessment = assessmentDoc.data();
    }
  }

  const urgencyColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
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
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/contractor/leads">
              <Button variant="outline" size="sm">
                Back to Leads
              </Button>
            </Link>
            <Link href="/dashboard/contractor">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Lead Header */}
        <Card className="p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Home Modification Lead
              </h1>
              <div className="flex gap-2">
                <Badge className={urgencyColors[lead.status as keyof typeof urgencyColors]}>
                  {lead.status?.toUpperCase()} Priority
                </Badge>
                {isPurchased && (
                  <Badge className="bg-blue-100 text-blue-800">
                    ✓ Purchased
                  </Badge>
                )}
                {!isPurchased && (
                  <Badge variant="outline">
                    Preview
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Lead Price</div>
              <div className="text-3xl font-bold text-blue-600">
                ${((lead.leadPrice ?? 2500) / 100).toFixed(2)}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Location */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">LOCATION</h3>
            <p className="text-lg text-gray-900">
              {lead.address.city}, {lead.address.state} {isPurchased ? lead.address.zipCode : ""}
            </p>
            {!isPurchased && (
              <p className="text-sm text-gray-500 mt-1">
                Full address available after purchase
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">PROJECT DESCRIPTION</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{lead.description}</p>
          </div>

          {/* Project Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">BUDGET RANGE</h3>
              <p className="text-gray-900">{lead.budget?.min} - {lead.budget?.max}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">POSTED DATE</h3>
              <p className="text-gray-900">
                {new Date(lead.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Contact Information (Only if purchased) */}
          {isPurchased && (
            <>
              <Separator className="my-6" />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Homeowner Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Name:</span>{" "}
                    <span className="text-gray-900">
                      {lead.homeownerName || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Full Address:</span>{" "}
                    {/* {/* <span className="text-gray-900">
                      {lead.address.street || "Not provided"}<br />
                      {lead.address.city}, {lead.address.state} {lead.address.zipCode}
                    </span> */}
                    {lead.address.street} {lead.address.city}, {lead.address.state} {lead.address.zipCode}
                  </div>
                  {lead.address.street} {lead.address.city}, {lead.address.state} {lead.address.zipCode}
                  <Button className="mt-4 w-full md:w-auto">
                    Contact Homeowner
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* AR Assessment (Only if purchased and available) */}
        {isPurchased && arAssessment && arAssessment.status === "complete" && (
          <Card className="p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AR Assessment Results
            </h2>
            
            {arAssessment.results?.hazards && arAssessment.results.hazards.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Identified Hazards
                </h3>
                <div className="space-y-3">
                  {arAssessment.results.hazards.map((hazard: Hazard, idx: number) => (
                    <div key={idx} className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-red-600 font-bold">⚠️</span>
                      <div>
                        <div className="font-semibold text-gray-900">{hazard.type}</div>
                        <div className="text-gray-700">{hazard.description}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Severity: {hazard.severity}/10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {arAssessment.results?.recommendations && arAssessment.results.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Recommended Modifications
                </h3>
                <div className="space-y-3">
                  {arAssessment.results.recommendations.map((rec: Recommendation, idx: number) => (
                    <div key={idx} className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-600 font-bold">✓</span>
                      <div>
                        <div className="font-semibold text-gray-900">{rec.title}</div>
                        <div className="text-gray-700">{rec.description}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Priority: {rec.priority}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Estimated Cost: ${rec.estimatedCost?.min} - ${rec.estimatedCost?.max}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Related Specialty: {rec.relatedSpecialty}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {arAssessment.results?.visualizations?.[0] && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Visualization
                </h3>
                <Image
                  src={arAssessment.results.visualizations[0]}
                  alt="After modification visualization"
                  className="rounded-lg shadow-lg"
                  width={1000}
                  height={1000}
                />
              </div>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        {!isPurchased && (
          <Card className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Ready to connect with this homeowner?
                </h3>
                <p className="text-gray-600">
                  Purchase this lead to access full contact details and AR assessment
                </p>
              </div>
              <form action={`/api/leads/${lead.id}/purchase`} method="POST">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Purchase for ${((lead.leadPrice ?? 2500) / 100).toFixed(2)}
                </Button>
              </form>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

