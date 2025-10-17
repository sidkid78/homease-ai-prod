'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Download, Share2 } from "lucide-react";
import { ARAssessment, Hazard, Recommendation } from "@/types";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

export default function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [assessment, setAssessment] = useState<ARAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Set up real-time listener for assessment updates
    const assessmentRef = doc(db, "ar-assessments", id);
    
    const unsubscribe = onSnapshot(
      assessmentRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setAssessment({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            processedAt: data.processedAt?.toDate(),
          } as ARAssessment);
          setLoading(false);
        } else {
          setError("Assessment not found");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to assessment:", err);
        setError("Failed to load assessment");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-purple-100 text-purple-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Assessment not found"}</p>
          <Link href="/dashboard/homeowner/assessments">
            <Button>Back to Assessments</Button>
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
            <span className="text-sm text-gray-600">Assessment Results</span>
          </div>
          <Link href="/dashboard/homeowner/assessments">
            <Button variant="outline">Back to Assessments</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Status Banner */}
        {assessment.status === 'uploading' && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Uploading Images...</h3>
                <p className="text-sm text-blue-700">Your images are being uploaded to secure storage.</p>
              </div>
            </div>
          </Card>
        )}

        {assessment.status === 'processing' && (
          <Card className="p-6 mb-6 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">AI Analysis in Progress...</h3>
                <p className="text-sm text-purple-700">
                  Our AI is analyzing your images. This usually takes 30-60 seconds.
                </p>
              </div>
            </div>
          </Card>
        )}

        {assessment.status === 'failed' && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Processing Failed</h3>
                <p className="text-sm text-red-700">
                  Sorry, we couldn't process your assessment. Please try again or contact support.
                </p>
              </div>
            </div>
          </Card>
        )}

        {assessment.status === 'complete' && assessment.results && (
          <>
            {/* Success Banner */}
            <Card className="p-6 mb-6 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Assessment Complete!</h3>
                    <p className="text-sm text-green-700">
                      {assessment.results.hazards.length} potential hazard(s) identified with{" "}
                      {assessment.results.recommendations.length} recommendation(s)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>

            {/* Assessment Info */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {assessment.room.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')} Assessment
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Completed:</span>
                  <p className="font-medium">
                    {assessment.processedAt?.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Images Analyzed:</span>
                  <p className="font-medium">{assessment.rawDataUrls.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Estimated Cost:</span>
                  <p className="font-medium">
                    {assessment.results.estimatedCost
                      ? `$${assessment.results.estimatedCost.min.toLocaleString()} - $${assessment.results.estimatedCost.max.toLocaleString()}`
                      : 'Contact contractor for quote'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Hazards Section */}
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🚨 Identified Hazards
              </h3>
              {assessment.results.hazards.length > 0 ? (
                <div className="space-y-4">
                  {assessment.results.hazards.map((hazard, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {hazard.type}
                        </h4>
                        <Badge className={getSeverityColor(hazard.severity)}>
                          {hazard.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Location:</span> {hazard.location}
                      </p>
                      <p className="text-sm text-gray-700">{hazard.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hazards identified.</p>
              )}
            </Card>

            {/* Recommendations Section */}
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ✅ Recommendations
              </h3>
              {assessment.results.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {assessment.results.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                      {rec.estimatedCost && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Estimated Cost:</span> $
                          {rec.estimatedCost.min.toLocaleString()} - $
                          {rec.estimatedCost.max.toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Specialty: {rec.relatedSpecialty}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recommendations available.</p>
              )}
            </Card>

            {/* Visualizations Section */}
            {assessment.results.visualizations && assessment.results.visualizations.length > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🎨 Before & After Visualizations
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {assessment.results.visualizations.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={url}
                        alt={`Visualization ${index + 1}`}
                        className="w-full rounded-lg border border-gray-200"
                      />
                      <p className="text-sm text-gray-600 text-center">
                        After Modifications
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* CTA Section */}
            <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Make These Changes?
              </h3>
              <p className="text-gray-600 mb-6">
                Connect with vetted contractors who specialize in accessibility modifications
              </p>
              <Link href={`/dashboard/homeowner/leads/new?assessmentId=${assessment.id}`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8">
                  Find Contractors
                </Button>
              </Link>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

