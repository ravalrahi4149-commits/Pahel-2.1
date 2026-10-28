const API_BASE_URL =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : "")
    : "http://127.0.0.1:5000";

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  organization: string;
  languagePreference: string;
  themePreference: string;
  createdAt: string;
}

export interface Building {
  id: number;
  userId: number;
  name: string;
  identifier: string;
  address: string;
  buildingType: string;
  floors: number;
  yearBuilt?: number;
  description?: string;
  contactPerson?: string;
  monitoringStatus: "active" | "review_needed" | "archived";
  createdAt: string;
  updatedAt?: string;
  inspectionCount: number;
  latestInspectionDate?: string;
  latestDetectedAreaPct?: number;
  latestReviewStatus?: string;
  inspections?: Inspection[];
}

export interface InspectionRegion {
  id: number;
  bbox: [number, number, number, number];
  area: number;
  approxLengthPx: number;
  centroid: [number, number];
}

export interface Inspection {
  id: number;
  buildingId: number;
  buildingName?: string;
  userId: number;
  inspectorName?: string;
  inspectionDate: string;
  surfaceType: string;
  location: string;
  notes?: string;
  originalImageUrl: string;
  overlayImageUrl?: string;
  maskImageUrl?: string;
  detectionMethod: string;
  modelVersion: string;
  imageWidth: number;
  imageHeight: number;
  detectedPixelArea: number;
  detectedPixelPercentage: number;
  regionCount: number;
  regionsData: InspectionRegion[];
  calibrationFactor?: number;
  estimatedPhysicalAreaMm2?: number;
  processingDurationMs: number;
  reviewStatus: "pending_review" | "verified_record" | "requires_qualified_review";
  reviewerNotes?: string;
  warnings: string[];
  createdAt: string;
}

export interface Comparison {
  id: number;
  userId: number;
  buildingId: number;
  buildingName?: string;
  earlierInspectionId: number;
  laterInspectionId: number;
  earlierInspection?: Inspection;
  laterInspection?: Inspection;
  percentagePointDiff: number;
  relativePercentageChange?: number;
  alignmentScore: number;
  diffImageUrl?: string;
  elapsedDays?: number;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  notificationType: "info" | "warning" | "success" | "review_alert";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalBuildings: number;
  totalInspections: number;
  verifiedCount: number;
  reviewNeededCount: number;
  pendingCount: number;
  averageCrackAreaPct: number;
  recentInspections: Inspection[];
  flaggedBuildings: Building[];
  surfaceDistribution: { name: string; value: number }[];
  trendTimeline: { id: number; date: string; buildingName: string; detectedAreaPct: number; regionCount: number }[];
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("cracklife_token") : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.warn(`[API] Network call to ${endpoint} failed, falling back if demo mode is available.`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: UserProfile; token: string }>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; fullName: string; organization?: string }) =>
    request<{ user: UserProfile; token: string }>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getProfile: () => request<{ user: UserProfile }>("/api/auth/profile"),

  updateProfile: (data: Partial<UserProfile>) =>
    request<{ user: UserProfile }>("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    }),

  // Buildings
  getBuildings: (params: { search?: string; type?: string; status?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append("search", params.search);
    if (params.type) q.append("type", params.type);
    if (params.status) q.append("status", params.status);
    return request<{ buildings: Building[]; total: number }>(`/api/buildings?${q.toString()}`);
  },

  getBuilding: (id: number) => request<{ building: Building }>(`/api/buildings/${id}`),

  createBuilding: (data: Partial<Building>) =>
    request<{ building: Building }>("/api/buildings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updateBuilding: (id: number, data: Partial<Building>) =>
    request<{ building: Building }>(`/api/buildings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteBuilding: (id: number) =>
    request<{ message: string }>(`/api/buildings/${id}`, { method: "DELETE" }),

  // Inspections
  getInspections: (params: { buildingId?: number; surfaceType?: string; reviewStatus?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.buildingId) q.append("buildingId", String(params.buildingId));
    if (params.surfaceType) q.append("surfaceType", params.surfaceType);
    if (params.reviewStatus) q.append("reviewStatus", params.reviewStatus);
    return request<{ inspections: Inspection[]; total: number }>(`/api/inspections?${q.toString()}`);
  },

  getInspection: (id: number) => request<{ inspection: Inspection }>(`/api/inspections/${id}`),

  uploadAndAnalyzeInspection: (formData: FormData) =>
    request<{ message: string; inspection: Inspection }>("/api/inspections/upload", {
      method: "POST",
      body: formData,
    }),

  updateInspectionReview: (
    id: number,
    data: { reviewStatus?: string; reviewerNotes?: string; notes?: string }
  ) =>
    request<{ inspection: Inspection }>(`/api/inspections/${id}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteInspection: (id: number) =>
    request<{ message: string }>(`/api/inspections/${id}`, { method: "DELETE" }),

  // Comparisons
  getComparisons: (buildingId?: number) => {
    const q = buildingId ? `?buildingId=${buildingId}` : "";
    return request<{ comparisons: Comparison[]; total: number }>(`/api/comparisons${q}`);
  },

  getComparison: (id: number) => request<{ comparison: Comparison }>(`/api/comparisons/${id}`),

  createComparison: (data: { buildingId: number; earlierInspectionId: number; laterInspectionId: number; notes?: string }) =>
    request<{ comparison: Comparison }>("/api/comparisons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteComparison: (id: number) =>
    request<{ message: string }>(`/api/comparisons/${id}`, { method: "DELETE" }),

  // Dashboard
  getDashboardStats: () => request<DashboardStats>("/api/dashboard/stats"),

  // Reports
  getInspectionPdfUrl: (inspectionId: number) => `${API_BASE_URL}/api/reports/inspection/${inspectionId}/pdf`,
  getInspectionsCsvUrl: () => `${API_BASE_URL}/api/reports/inspections/csv`,

  // Notifications
  getNotifications: () =>
    request<{ notifications: NotificationItem[]; unreadCount: number }>("/api/notifications"),

  markNotificationRead: (id: number) =>
    request<{ message: string }>(`/api/notifications/${id}/read`, { method: "PUT" }),

  markAllNotificationsRead: () =>
    request<{ message: string }>("/api/notifications/read-all", { method: "PUT" }),

  dismissNotification: (id: number) =>
    request<{ message: string }>(`/api/notifications/${id}`, { method: "DELETE" }),

  // Helper to construct image urls
  getImageUrl: (pathOrUrl?: string) => {
    if (!pathOrUrl) return "/placeholder-wall.jpg";
    if (pathOrUrl.startsWith("http") || pathOrUrl.startsWith("data:")) return pathOrUrl;
    if (pathOrUrl.startsWith("/api/")) return `${API_BASE_URL}${pathOrUrl}`;
    return `${API_BASE_URL}/api/media/image/${pathOrUrl}`;
  },
};
