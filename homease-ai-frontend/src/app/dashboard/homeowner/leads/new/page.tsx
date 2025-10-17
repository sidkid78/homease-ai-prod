'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { Recommendation, Specialty, UrgencyLevel } from "@/types";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";

export default function NewLeadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const assessmentId = searchParams?.get('assessmentId');

  const [loading, setLoading] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(!!assessmentId);
  const [error, setError] = useState("");

  // Form fields
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel | "">("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);

  const specialtyOptions: { value: Specialty; label: string }[] = [
    { value: "bathroom-modification", label: "Bathroom Modification" },
    { value: "ramp-installation", label: "Ramp Installation" },
    { value: "grab-bar-installation", label: "Grab Bar Installation" },
    { value: "stairlift-installation", label: "Stairlift Installation" },
    { value: "doorway-widening", label: "Doorway Widening" },
    { value: "flooring", label: "Flooring" },
    { value: "lighting", label: "Lighting" },
    { value: "kitchen-modification", label: "Kitchen Modification" },
    { value: "general-accessibility", label: "General Accessibility" },
  ];

  useEffect(() => {
    if (assessmentId && session?.user) {
      loadAssessmentData();
    }
  }, [assessmentId, session]);

  const loadAssessmentData = async () => {
    try {
      const assessmentRef = doc(db, "ar-assessments", assessmentId!);
      const assessmentDoc = await getDoc(assessmentRef);

      if (assessmentDoc.exists()) {
        const data = assessmentDoc.data();
        
        // Pre-fill description from assessment
        if (data.results?.recommendations) {
          const recommendationsSummary = data.results.recommendations
            .map((rec: Recommendation) => `• ${rec.title}`)
            .join('\n');
          setDescription(
            `Based on my ${data.room} assessment:\n\n${recommendationsSummary}\n\n${data.description || ''}`
          );
        }

        // Pre-select specialties from recommendations
        if (data.results?.recommendations) {
          const specs = data.results.recommendations
            .map((rec: Recommendation) => rec.relatedSpecialty)
            .filter((spec: Specialty) => spec) as Specialty[];
          setSelectedSpecialties([...new Set(specs)]);
        }
      }
      setLoadingAssessment(false);
    } catch (err) {
      console.error("Error loading assessment:", err);
      setLoadingAssessment(false);
    }
  };

  const handleSpecialtyToggle = (specialty: Specialty) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!session?.user) {
      setError("You must be logged in to create a lead");
      return;
    }

    // Validation
    if (!description.trim()) {
      setError("Please provide a project description");
      return;
    }
    if (!urgency) {
      setError("Please select an urgency level");
      return;
    }
    if (selectedSpecialties.length === 0) {
      setError("Please select at least one specialty");
      return;
    }
    if (!address || !city || !state || !zip) {
      setError("Please fill in all address fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arAssessmentId: assessmentId || undefined,
          description: description.trim(),
          urgency,
          budgetRange: budgetRange || undefined,
          timeline: timeline || undefined,
          homeownerInfo: {
            name: session.user.name || session.user.email,
            email: session.user.email,
            address,
            city,
            state,
            zip,
            propertyType: propertyType || undefined,
          },
          requiredSpecialties: selectedSpecialties,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create lead");
      }

      const { leadId } = await response.json();

      // Redirect to matched contractors page
      router.push(`/dashboard/homeowner/leads/${leadId}`);
    } catch (err) {
      console.error("Error creating lead:", err);
      setError(err instanceof Error ? err.message : "Failed to create lead");
      setLoading(false);
    }
  };

  if (loadingAssessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
            <span className="text-sm text-gray-600">Find Contractors</span>
          </div>
          <Link href="/dashboard/homeowner">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Vetted Contractors
          </h1>
          <p className="text-gray-600 mb-8">
            Tell us about your project and we&apos;ll match you with qualified accessibility contractors
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                Project Description *
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the modifications you need for your home..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px]"
                required
              />
            </div>

            {/* Urgency */}
            <div>
              <Label htmlFor="urgency" className="text-base font-semibold mb-2 block">
                How urgent is this project? *
              </Label>
              <Select value={urgency} onValueChange={(value) => setUrgency(value as UrgencyLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Planning ahead</SelectItem>
                  <SelectItem value="medium">Medium - Within a few months</SelectItem>
                  <SelectItem value="high">High - Need work ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Range */}
            <div>
              <Label htmlFor="budgetRange" className="text-base font-semibold mb-2 block">
                Budget Range (Optional)
              </Label>
              <Select value={budgetRange} onValueChange={setBudgetRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-1000">Under $1,000</SelectItem>
                  <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                  <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                  <SelectItem value="over-25000">Over $25,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeline */}
            <div>
              <Label htmlFor="timeline" className="text-base font-semibold mb-2 block">
                Preferred Timeline (Optional)
              </Label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger>
                  <SelectValue placeholder="When do you want to start?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">As soon as possible</SelectItem>
                  <SelectItem value="1-2weeks">Within 1-2 weeks</SelectItem>
                  <SelectItem value="1month">Within a month</SelectItem>
                  <SelectItem value="1-3months">1-3 months</SelectItem>
                  <SelectItem value="3-6months">3-6 months</SelectItem>
                  <SelectItem value="planning">Just planning/researching</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Required Specialties */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                What type of work do you need? * (Select all that apply)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {specialtyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${selectedSpecialties.includes(option.value)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSpecialties.includes(option.value)}
                      onChange={() => handleSpecialtyToggle(option.value)}
                      className="mr-3"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Property Address */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Property Address</h3>
              
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <input
                    type="text"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <input
                    type="text"
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="12345"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type (Optional)</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-family">Single Family Home</SelectItem>
                    <SelectItem value="condo">Condo/Townhouse</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="multi-family">Multi-Family</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/homeowner" className="flex-1">
                <Button type="button" variant="outline" className="w-full h-12">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Finding Contractors...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Find Contractors
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

