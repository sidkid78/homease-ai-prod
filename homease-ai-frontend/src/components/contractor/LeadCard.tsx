"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  homeownerInfo: {
    displayName?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  description: string;
  urgency: "low" | "medium" | "high";
  budgetRange?: string;
  status: string;
  price?: number;
  createdAt: string;
  purchasedBy?: string[];
}

interface LeadCardProps {
  lead: Lead;
  contractorId: string;
  onPurchase?: (leadId: string) => void;
}

export function LeadCard({ lead, contractorId, onPurchase }: LeadCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isPurchased = lead.purchasedBy?.includes(contractorId);

  const urgencyColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/purchase`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to purchase lead");
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert(error instanceof Error ? error.message : "Failed to purchase lead");
      setIsLoading(false);
    }
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return "$25.00"; // Default
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {lead.homeownerInfo.city}, {lead.homeownerInfo.state}
          </h3>
          <div className="flex gap-2 items-center">
            <Badge className={urgencyColors[lead.urgency]}>
              {lead.urgency.toUpperCase()} Priority
            </Badge>
            {isPurchased && (
              <Badge className="bg-blue-100 text-blue-800">
                Purchased
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(lead.price)}
          </div>
          <div className="text-sm text-gray-500">per lead</div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 line-clamp-3">{lead.description}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Budget:</span> {lead.budgetRange || "Not specified"}
        </div>
        <div className="text-sm text-gray-500">
          {new Date(lead.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="pt-4 border-t">
        {isPurchased ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = `/dashboard/contractor/leads/${lead.id}`}
          >
            View Details
          </Button>
        ) : (
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Processing..." : `Purchase for ${formatPrice(lead.price)}`}
          </Button>
        )}
      </div>
    </Card>
  );
}

