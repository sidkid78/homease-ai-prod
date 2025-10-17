'use client';

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, MapPin, Briefcase, Phone, Mail } from "lucide-react";
import { Lead, ContractorProfile, User } from "@/types";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";

export default function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [matchedContractors, setMatchedContractors] = useState<(User & { contractorProfile: ContractorProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Set up real-time listener for lead updates
    const leadRef = doc(db, "leads", id);
    
    const unsubscribe = onSnapshot(
      leadRef,
      async (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const leadData = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString(),
          } as Lead;
          
          setLead(leadData);
          setLoading(false);

          // Load matched contractors
          if (leadData.matchedContractorIds && leadData.matchedContractorIds.length > 0) {
            loadMatchedContractors(leadData.matchedContractorIds);
          }
        } else {
          setError("Lead not found");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to lead:", err);
        setError("Failed to load lead");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const loadMatchedContractors = async (contractorIds: string[]) => {
    setLoadingContractors(true);
    try {
      const contractorsRef = collection(db, "users");
      const contractorsSnapshot = await getDocs(contractorsRef);
      
      const contractors = contractorsSnapshot.docs
        .filter(doc => contractorIds.includes(doc.id))
        .map(doc => ({
          uid: doc.id,
          ...doc.data(),
        })) as (User & { contractorProfile: ContractorProfile })[];

      setMatchedContractors(contractors);
    } catch (err) {
      console.error("Error loading contractors:", err);
    } finally {
      setLoadingContractors(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'matching':
        return 'bg-purple-100 text-purple-800';
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Lead not found"}</p>
          <Link href="/dashboard/homeowner">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              HOMEase AI
            </Link>
            <span className="text-sm text-gray-600">Lead Details</span>
          </div>
          <Link href="/dashboard/homeowner">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Status Banner */}
        {lead.status === 'new' && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Lead Created</h3>
                <p className="text-sm text-blue-700">
                  Your lead has been created and is being processed.
                </p>
              </div>
            </div>
          </Card>
        )}

        {lead.status === 'matching' && (
          <Card className="p-6 mb-6 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">Finding Contractors...</h3>
                <p className="text-sm text-purple-700">
                  We&apos;re matching you with qualified contractors in your area. This usually takes a few moments.
                </p>
              </div>
            </div>
          </Card>
        )}

        {lead.status === 'matched' && matchedContractors.length > 0 && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-900 mb-1">
              ✅ {matchedContractors.length} Contractor(s) Matched!
            </h3>
            <p className="text-sm text-green-700">
              We&apos;ve found contractors who specialize in your needed modifications and serve your area.
            </p>
          </Card>
        )}

        {/* Lead Information */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Project</h2>
              <div className="flex gap-2">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status.toUpperCase()}
                </Badge>
                <Badge className={getUrgencyColor(lead.urgency)}>
                  {lead.urgency.toUpperCase()} URGENCY
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
              {lead.arAssessmentId && (
                <Link href={`/dashboard/homeowner/assessments/${lead.arAssessmentId}`}>
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    View Assessment
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{lead.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Required Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {lead.requiredSpecialties.map((specialty) => (
                    <Badge key={specialty} variant="outline">
                      {specialty.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Project Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {lead.budgetRange && <p>Budget: {lead.budgetRange}</p>}
                  {lead.timeline && <p>Timeline: {lead.timeline}</p>}
                  <p>
                    Location: {lead.homeownerInfo.city}, {lead.homeownerInfo.state}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Matched Contractors */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Matched Contractors</h2>

          {loadingContractors ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : matchedContractors.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {matchedContractors.map((contractor) => (
                <Card key={contractor.uid} className="p-6 hover:shadow-lg transition-shadow">
                  {/* Contractor Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {contractor.contractorProfile.businessName}
                      </h3>
                      {contractor.contractorProfile.averageRating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">
                            {contractor.contractorProfile.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({contractor.contractorProfile.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  </div>

                  {/* Contractor Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>
                        {contractor.contractorProfile.completedProjects || 0} projects completed
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>
                        Serves {contractor.contractorProfile.serviceAreaZips.length} ZIP codes
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {contractor.contractorProfile.specialties.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </Badge>
                        ))}
                        {contractor.contractorProfile.specialties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{contractor.contractorProfile.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // In a real app, this would open a contact form or messaging system
                        alert(`Request quote from ${contractor.contractorProfile.businessName}\n\nThis feature will be available soon!`);
                      }}
                    >
                      Request Quote
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      {contractor.email && (
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                      )}
                      {contractor.phoneNumber && (
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 mb-2">
                {lead.status === 'matching' 
                  ? 'Still searching for contractors...'
                  : 'No contractors matched yet'}
              </p>
              <p className="text-sm text-gray-400">
                {lead.status === 'matching'
                  ? 'This usually takes just a moment. The page will update automatically.'
                  : 'We\'ll notify you when contractors are matched to your project.'}
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

