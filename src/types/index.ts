// ASGIP domain types — mirror the FastAPI backend contract.

export type Role = "CITIZEN" | "OFFICER" | "DEPARTMENT_ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
}

export type ComplaintStatus =
  | "SUBMITTED"
  | "AI_ANALYZED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "AWAITING_INFO"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED"
  | "ESCALATED";

export type ComplaintPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type SlaStatus = "ON_TRACK" | "AT_RISK" | "OVERDUE" | "ESCALATED";

export type ComplaintCategory =
  | "Electricity"
  | "Water Supply"
  | "Sanitation"
  | "Roads & Transport"
  | "Public Safety"
  | "Health"
  | "Education"
  | "Environment"
  | "Housing"
  | "Other";

export interface Location {
  address: string;
  lat: number;
  lng: number;
  ward?: string;
  city?: string;
}

export interface Evidence {
  id: string;
  url: string;
  name: string;
  type: "image" | "document";
}

export interface AIAnalysis {
  category: ComplaintCategory;
  confidence: number; // 0..1
  priority: ComplaintPriority;
  urgencyScore: number; // 0..100
  reason: string;
  recommendedDepartmentId: string;
  recommendedDepartmentName: string;
  duplicateProbability: number; // 0..1
  similarComplaintIds: string[];
  keywords: string[];
  sentiment: "negative" | "neutral" | "positive";
  analyzedAt: string;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  actor: string;
  actorRole: Role | "SYSTEM";
  description: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  code: string; // e.g. GRV-2026-000123
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location: Location;
  evidence: Evidence[];
  citizenId: string;
  citizenName: string;
  departmentId?: string;
  departmentName?: string;
  officerId?: string;
  officerName?: string;
  createdAt: string;
  updatedAt: string;
  expectedResolutionAt: string;
  resolvedAt?: string;
  slaStatus: SlaStatus;
  aiAnalysis?: AIAnalysis;
  duplicateGroupId?: string;
  timeline: TimelineEvent[];
  remarks?: string;
}

export interface DuplicateGroup {
  id: string;
  primaryComplaintId: string;
  complaintIds: string[];
  similarity: number;
  detectedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  officerCount: number;
  totalComplaints: number;
  resolvedComplaints: number;
  slaCompliance: number; // 0..1
  categoriesHandled: ComplaintCategory[];
}

export interface Officer {
  id: string;
  fullName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  activeComplaints: number;
  resolvedComplaints: number;
  avgResolutionHours: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "COMPLAINT_ASSIGNED"
    | "STATUS_UPDATED"
    | "SLA_WARNING"
    | "ESCALATION"
    | "RESOLUTION"
    | "DUPLICATE_DETECTED";
  title: string;
  message: string;
  complaintId?: string;
  read: boolean;
  createdAt: string;
}

export interface SLARule {
  priority: ComplaintPriority;
  resolutionHours: number;
  firstResponseHours: number;
  escalationHours: number;
  escalateTo: Role;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entity: string;
  entityId: string;
  description: string;
}

export interface Analytics {
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  overdue: number;
  slaCompliance: number;
  avgResolutionHours: number;
  byCategory: { category: string; count: number }[];
  byPriority: { priority: ComplaintPriority; count: number }[];
  monthlyTrend: { month: string; submitted: number; resolved: number }[];
  resolutionPerformance: { department: string; resolved: number; overdue: number }[];
}

export interface SystemStats {
  totalCitizens: number;
  totalOfficers: number;
  totalDepartments: number;
  totalComplaints: number;
  resolutionRate: number;
  slaCompliance: number;
  criticalComplaints: number;
  duplicateComplaints: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}
