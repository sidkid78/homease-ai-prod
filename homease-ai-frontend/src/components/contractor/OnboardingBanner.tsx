"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OnboardingBannerProps {
  vettingStatus: string | null;
}

export function OnboardingBanner({ vettingStatus }: OnboardingBannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartOnboarding = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contractor/onboarding/start", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start onboarding");
      }

      const data = await response.json();
      
      // Redirect to Stripe onboarding
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Failed to start onboarding. Please try again.");
      setIsLoading(false);
    }
  };

  // Don't show banner if already approved
  if (vettingStatus === "approved") {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🚀</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {vettingStatus === "pending_stripe" 
              ? "Complete Your Onboarding" 
              : "Start Your Contractor Journey"}
          </h3>
          <p className="text-gray-700 mb-4">
            {vettingStatus === "pending_stripe"
              ? "Finish setting up your account with Stripe to start receiving leads."
              : "Complete a quick verification process to access exclusive home modification leads in your area."}
          </p>
          <Button
            onClick={handleStartOnboarding}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Loading..." : vettingStatus === "pending_stripe" ? "Continue Setup" : "Get Started"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

