export type LeadStatus = 'Live' | 'Closed' | 'Lost';
export type LeadSource = 'Website' | 'Referral' | 'Cold Call' | 'Event' | 'Partner' | 'Other';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  stage: string;
  nextAction: string;
  nextActionDate: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  
  // Additional fields from Supabase
  productsInterested?: string;
  location?: string;
  website?: string;
  proposalShared?: boolean;
  remark?: string;
  dateOfLastInteraction?: string;
}

export interface Partner {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: string;
  agreementDate: string;
  notes: string;
  createdAt: string;
  
  // Additional fields from Supabase
  natureOfContract?: string;
  engagementLetterSent?: boolean;
  acceptanceStatus?: string;
  engagementLetterReference?: string;
  businessRemark?: string;
  internalRemark?: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  serviceProvided: string;
  startDate: string;
  endDate: string | null;
  status: string;
  notes: string;
  
  // Additional fields from Supabase
  companyName?: string;
  city?: string;
  country?: string;
  bdRepresentative?: string;
  engagementDetails?: string;
  remark?: string;
}

export interface DailyActivity {
  id: string;
  date: string;
  userId: string;
  leadId: string | null;
  partnerId: string | null;
  clientId?: string | null;
  activityType: string;
  description: string;
  outcome: string;
  nextSteps: string;
  duration: number;
  createdAt: string;
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  date: string;
  type: string;
  description: string;
  outcome: string;
  nextSteps: string;
  userId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Sales';
  avatar: string | null;
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: any[];
  errors?: string[];
}