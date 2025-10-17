'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, FileText } from "lucide-react";
import { ARAssessment, AssessmentStatus, RoomType } from "@/types";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useSession } from "next-auth/react";

export default function AssessmentsListPage() {
  const { data: session } = useSession();
  const [assessments, setAssessments] = useState<ARAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!session?.user?.id) return;

    // Set up real-time listener for assessments
    const assessmentsRef = collection(db, "ar-assessments");
    const q = query(
      assessmentsRef,
      where("userId", "==", session.user.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const assessmentsList: ARAssessment[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          processedAt: doc.data().processedAt?.toDate(),
        })) as ARAssessment[];
        
        setAssessments(assessmentsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching assessments:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [session]);

  const getStatusColor = (status: AssessmentStatus) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesRoom = roomFilter === "all" || assessment.room === roomFilter;
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
    return matchesRoom && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              HOMEase AI
            </Link>
            <span className="text-sm text-gray-600">My Assessments</span>
          </div>
          <Link href="/dashboard/homeowner">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Assessments</h1>
            <p className="text-gray-600 mt-1">
              View and manage your home accessibility assessments
            </p>
          </div>
          <Link href="/dashboard/homeowner/assessments/new">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              New Assessment
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Filter by Room
              </label>
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Rooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="living-room">Living Room</SelectItem>
                  <SelectItem value="hallway">Hallway</SelectItem>
                  <SelectItem value="stairs">Stairs</SelectItem>
                  <SelectItem value="entrance">Entrance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Filter by Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="uploading">Uploading</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Assessments Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredAssessments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <Link
                key={assessment.id}
                href={`/dashboard/homeowner/assessments/${assessment.id}`}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {/* Thumbnail/Icon */}
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-4 flex items-center justify-center">
                    {assessment.rawDataUrls.length > 0 ? (
                      <img
                        src={assessment.rawDataUrls[0]}
                        alt={assessment.room}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileText className="w-16 h-16 text-blue-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-gray-900 capitalize">
                        {assessment.room.split('-').join(' ')}
                      </h3>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status}
                      </Badge>
                    </div>

                    {assessment.status === 'complete' && assessment.results && (
                      <div className="text-sm text-gray-600">
                        <p>
                          {assessment.results.hazards.length} hazard(s) found
                        </p>
                        <p>
                          {assessment.results.recommendations.length} recommendation(s)
                        </p>
                      </div>
                    )}

                    {assessment.status === 'processing' && (
                      <div className="flex items-center text-sm text-purple-600">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Analyzing...
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      {assessment.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>

                    {assessment.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {assessment.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/dashboard/homeowner/assessments/${assessment.id}`;
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Assessments Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first home accessibility assessment
            </p>
            <Link href="/dashboard/homeowner/assessments/new">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                Create Assessment
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  );
}

