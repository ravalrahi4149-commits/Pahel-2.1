import { DEMO_MODE } from "@/lib/env";
import { db } from "@/services/mock/seed";
import { delay, http } from "./http";
import type { Complaint, ComplaintStatus, TimelineEvent } from "@/types";

export interface ComplaintFilters {
  status?: ComplaintStatus;
  priority?: string;
  category?: string;
  search?: string;
  citizenId?: string;
  officerId?: string;
  departmentId?: string;
}

export const complaintApi = {
  async list(filters: ComplaintFilters = {}): Promise<Complaint[]> {
    if (DEMO_MODE) {
      let list = [...db().complaints];
      if (filters.status) list = list.filter((c) => c.status === filters.status);
      if (filters.priority) list = list.filter((c) => c.priority === filters.priority);
      if (filters.category) list = list.filter((c) => c.category === filters.category);
      if (filters.citizenId) list = list.filter((c) => c.citizenId === filters.citizenId);
      if (filters.officerId) list = list.filter((c) => c.officerId === filters.officerId);
      if (filters.departmentId) list = list.filter((c) => c.departmentId === filters.departmentId);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.location.address.toLowerCase().includes(q),
        );
      }
      list.sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1));
      return delay(list, 200);
    }
    const params = new URLSearchParams(filters as Record<string, string>);
    return http<Complaint[]>(`/complaints?${params}`);
  },

  async get(id: string): Promise<Complaint> {
    if (DEMO_MODE) {
      const c = db().complaints.find((c) => c.id === id || c.code === id);
      if (!c) throw new Error("Complaint not found");
      return delay(c, 150);
    }
    return http<Complaint>(`/complaints/${id}`);
  },

  async create(payload: Partial<Complaint>): Promise<Complaint> {
    if (DEMO_MODE) {
      const id = `cmp-${Date.now()}`;
      const now = new Date();
      const code = `GRV-2026-${String(db().complaints.length + 1).padStart(6, "0")}`;
      const citizen = db().users.find((u) => u.id === payload.citizenId) || db().users[0];
      const complaint: Complaint = {
        id,
        code,
        title: payload.title || "Untitled",
        description: payload.description || "",
        category: payload.category || "Other",
        priority: payload.priority || "MEDIUM",
        status: "AI_ANALYZED",
        location: payload.location!,
        evidence: payload.evidence || [],
        citizenId: citizen.id,
        citizenName: citizen.fullName,
        departmentId: payload.aiAnalysis?.recommendedDepartmentId,
        departmentName: payload.aiAnalysis?.recommendedDepartmentName,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expectedResolutionAt: new Date(
          now.getTime() +
            ({ CRITICAL: 6, HIGH: 24, MEDIUM: 72, LOW: 168 }[payload.priority || "MEDIUM"]) * 3600e3,
        ).toISOString(),
        slaStatus: "ON_TRACK",
        aiAnalysis: payload.aiAnalysis,
        timeline: [
          {
            id: `evt-0-${now.getTime()}`,
            status: "SUBMITTED",
            actor: citizen.fullName,
            actorRole: "CITIZEN",
            description: "Complaint submitted by citizen.",
            timestamp: now.toISOString(),
          },
          {
            id: `evt-1-${now.getTime()}`,
            status: "AI_ANALYZED",
            actor: "ASGIP AI",
            actorRole: "SYSTEM",
            description: "AI classified, prioritized and recommended department.",
            timestamp: new Date(now.getTime() + 2000).toISOString(),
          },
        ],
      };
      db().complaints.unshift(complaint);
      return delay(complaint, 400);
    }
    return http<Complaint>("/complaints", { method: "POST", body: JSON.stringify(payload) });
  },

  async updateStatus(id: string, status: ComplaintStatus, remarks?: string): Promise<Complaint> {
    if (DEMO_MODE) {
      const c = db().complaints.find((c) => c.id === id);
      if (!c) throw new Error("Complaint not found");
      c.status = status;
      c.updatedAt = new Date().toISOString();
      const evt: TimelineEvent = {
        id: `evt-${Date.now()}`,
        status,
        actor: "Demo Officer",
        actorRole: "OFFICER",
        description: remarks || `Status changed to ${status}.`,
        timestamp: new Date().toISOString(),
      };
      c.timeline.push(evt);
      if (status === "RESOLVED" || status === "CLOSED") c.resolvedAt = new Date().toISOString();
      return delay(c, 200);
    }
    return http<Complaint>(`/complaints/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, remarks }),
    });
  },

  async addRemark(id: string, remark: string): Promise<Complaint> {
    if (DEMO_MODE) {
      const c = db().complaints.find((c) => c.id === id);
      if (!c) throw new Error("Complaint not found");
      c.timeline.push({
        id: `evt-${Date.now()}`,
        status: c.status,
        actor: "Demo Officer",
        actorRole: "OFFICER",
        description: remark,
        timestamp: new Date().toISOString(),
      });
      return delay(c, 200);
    }
    return http<Complaint>(`/complaints/${id}/remarks`, {
      method: "POST",
      body: JSON.stringify({ remark }),
    });
  },
};
