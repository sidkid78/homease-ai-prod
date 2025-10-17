'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, Camera } from "lucide-react";
import { RoomType } from "@/types";
import { storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useSession } from "next-auth/react";

export default function NewAssessmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [room, setRoom] = useState<RoomType | "">("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const roomOptions: { value: RoomType; label: string }[] = [
    { value: "bathroom", label: "Bathroom" },
    { value: "bedroom", label: "Bedroom" },
    { value: "kitchen", label: "Kitchen" },
    { value: "living-room", label: "Living Room" },
    { value: "hallway", label: "Hallway" },
    { value: "stairs", label: "Stairs" },
    { value: "entrance", label: "Entrance" },
    { value: "other", label: "Other" },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 images
    const newFiles = [...selectedFiles, ...files].slice(0, 10);
    setSelectedFiles(newFiles);

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setError("");
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!session?.user?.id) {
      setError("You must be logged in to create an assessment");
      return;
    }

    if (!room) {
      setError("Please select a room type");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Create assessment document
      const createResponse = await fetch("/api/ar-assessments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          description,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create assessment");
      }

      const { assessmentId } = await createResponse.json();

      // Step 2: Upload images to Cloud Storage
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const storageRef = ref(
          storage,
          `ar-assessments/${session.user.id}/${assessmentId}/raw/image_${index}_${Date.now()}.jpg`
        );
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setUploadProgress(50);

      // Step 3: Trigger processing
      const processResponse = await fetch("/api/ar-assessments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          imageUrls: uploadedUrls,
        }),
      });

      if (!processResponse.ok) {
        throw new Error("Failed to start processing");
      }

      setUploadProgress(100);

      // Redirect to results page
      router.push(`/dashboard/homeowner/assessments/${assessmentId}`);
    } catch (err) {
      console.error("Error creating assessment:", err);
      setError(err instanceof Error ? err.message : "Failed to create assessment");
      setIsUploading(false);
    }
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
            <span className="text-sm text-gray-600">New Assessment</span>
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
            Start AR Assessment
          </h1>
          <p className="text-gray-600 mb-8">
            Upload photos of your home to get AI-powered accessibility recommendations
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Selection */}
            <div>
              <Label htmlFor="room" className="text-base font-semibold mb-2 block">
                Which room are you assessing? *
              </Label>
              <Select value={room} onValueChange={(value) => setRoom(value as RoomType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                Additional Details (Optional)
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe any specific concerns or areas you'd like us to focus on..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Upload Photos * (Max 10)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading || selectedFiles.length >= 10}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG up to 10MB each ({selectedFiles.length}/10 selected)
                  </p>
                </label>
              </div>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isUploading}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading and processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isUploading || !room || selectedFiles.length === 0}
                className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    Start Assessment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Tips */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">📸 Tips for Best Results</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Take photos from multiple angles</li>
            <li>• Ensure good lighting</li>
            <li>• Include doorways, thresholds, and potential hazards</li>
            <li>• Capture the full room when possible</li>
            <li>• Include close-ups of specific concerns</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}

