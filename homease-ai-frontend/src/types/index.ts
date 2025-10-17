// User Roles
export type UserRole = 'homeowner' | 'contractor' | 'admin';

// User Interface
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber?: string;
  address?: Address;
  contractorProfile?: ContractorProfile;
}

// Address Interface
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Contractor Profile
export interface ContractorProfile {
  businessName: string;
  licenseNumber: string;
  insuranceDocs: string[]; // Storage URLs
  specialties: Specialty[];
  serviceAreaZips: string[];
  vettingStatus: 'pending' | 'approved' | 'rejected';
  stripeAccountId?: string;
  stripeAccountStatus?: string;
  averageRating?: number;
  reviewCount?: number;
  completedProjects?: number;
}

// Specialties
export type Specialty = 
  | 'bathroom-modification'
  | 'ramp-installation'
  | 'grab-bar-installation'
  | 'stairlift-installation'
  | 'doorway-widening'
  | 'flooring'
  | 'lighting'
  | 'kitchen-modification'
  | 'general-accessibility';

// Lead Status
export type LeadStatus = 'new' | 'matching' | 'matched' | 'sold' | 'completed' | 'cancelled';

// Urgency Level
export type UrgencyLevel = 'low' | 'medium' | 'high';

// Lead Interface
export interface Lead {
  id: string;
  homeownerId: string;
  homeownerInfo: {
    name: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    propertyType?: string;
  };
  arAssessmentId?: string;
  description: string;
  requiredSpecialties: Specialty[];
  urgency: UrgencyLevel;
  budgetRange?: string; // e.g., "$1,000 - $5,000"
  timeline?: string; // e.g., "Within 2 weeks", "1-3 months"
  status: LeadStatus;
  price: number; // Price in cents that contractors pay for this lead
  matchedContractorIds: string[];
  purchasedBy: string[]; // Contractor IDs who purchased
  createdAt: string; // ISO string for serialization
  updatedAt?: string;
}

// AR Assessment Status
export type AssessmentStatus = 'uploading' | 'processing' | 'complete' | 'failed';

// Room Types
export type RoomType = 
  | 'bathroom'
  | 'bedroom'
  | 'kitchen'
  | 'living-room'
  | 'hallway'
  | 'stairs'
  | 'entrance'
  | 'other';

// AR Assessment Interface
export interface ARAssessment {
  id: string;
  userId: string;
  status: AssessmentStatus;
  room: RoomType;
  description?: string;
  rawDataUrls: string[]; // Cloud Storage URLs
  results?: {
    hazards: Hazard[];
    recommendations: Recommendation[];
    visualizations?: string[]; // URLs from Gemini image generation
    estimatedCost?: {
      min: number;
      max: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

// Hazard Interface
export interface Hazard {
  type: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  description: string;
  imageUrl?: string;
}

// Recommendation Interface
export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost?: {
    min: number;
    max: number;
  };
  relatedSpecialty: Specialty;
}

// Project Status
export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// Project Interface
export interface Project {
  id: string;
  leadId: string;
  homeownerId: string;
  contractorId: string;
  status: ProjectStatus;
  scope: string;
  agreedPrice?: number;
  startDate?: Date;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Interface
export interface Chat {
  id: string;
  participants: string[]; // User IDs
  leadId?: string;
  projectId?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

// Message Interface
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
  readBy: string[];
}

// Review Interface
export interface Review {
  id: string;
  projectId: string;
  homeownerId: string;
  contractorId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

// Transaction Interface
export interface Transaction {
  id: string; // Stripe session/payment intent ID
  contractorId: string;
  leadId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  stripeSessionId: string;
  createdAt: Date;
  completedAt?: Date;
}

