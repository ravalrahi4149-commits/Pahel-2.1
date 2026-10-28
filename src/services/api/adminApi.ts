import { DEMO_MODE } from "@/lib/env";
import { db } from "@/services/mock/seed";
import { delay, http } from "./http";
import type { Department, Officer, User, SLARule, AuditLog, SystemStats } from "@/types";

export const departmentApi = {
  async list(): Promise<Department[]> {
    if (DEMO_MODE) return delay(db().departments, 150);
    return http("/departments");
  },
  async get(id: string): Promise<Department> {
    if (DEMO_MODE) {
      const d = db().departments.find((x) => x.id === id);
      if (!d) throw new Error("Department not found");
      return delay(d, 100);
    }
    return http(`/departments/${id}`);
  },
  async create(payload: Partial<Department>): Promise<Department> {
    if (DEMO_MODE) {
      const d: Department = {
        id: `dept-${Date.now()}`,
        name: payload.name || "New Department",
        code: payload.code || "NEW",
        head: payload.head || "TBD",
        officerCount: 0,
        totalComplaints: 0,
        resolvedComplaints: 0,
        slaCompliance: 0,
        categoriesHandled: payload.categoriesHandled || [],
      };
      db().departments.push(d);
      return delay(d, 200);
    }
    return http("/departments", { method: "POST", body: JSON.stringify(payload) });
  },
};

export const officerApi = {
  async list(departmentId?: string): Promise<Officer[]> {
    if (DEMO_MODE) {
      const list = departmentId
        ? db().officers.filter((o) => o.departmentId === departmentId)
        : db().officers;
      return delay(list, 150);
    }
    return http(`/officers${departmentId ? `?departmentId=${departmentId}` : ""}`);
  },
};

export const userApi = {
  async list(role?: string): Promise<User[]> {
    if (DEMO_MODE) {
      const list = role ? db().users.filter((u) => u.role === role) : db().users;
      return delay(list, 150);
    }
    return http(`/users${role ? `?role=${role}` : ""}`);
  },
  async setActive(id: string, isActive: boolean): Promise<User> {
    if (DEMO_MODE) {
      const u = db().users.find((u) => u.id === id);
      if (!u) throw new Error("User not found");
      u.isActive = isActive;
      return delay(u, 100);
    }
    return http(`/users/${id}`, { method: "PATCH", body: JSON.stringify({ isActive }) });
  },
};

export const slaApi = {
  async list(): Promise<SLARule[]> {
    if (DEMO_MODE) return delay(db().slaRules, 100);
    return http("/sla-rules");
  },
  async update(priority: string, patch: Partial<SLARule>): Promise<SLARule> {
    if (DEMO_MODE) {
      const r = db().slaRules.find((r) => r.priority === priority);
      if (!r) throw new Error("Rule not found");
      Object.assign(r, patch);
      return delay(r, 150);
    }
    return http(`/sla-rules/${priority}`, { method: "PATCH", body: JSON.stringify(patch) });
  },
};

export const auditApi = {
  async list(): Promise<AuditLog[]> {
    if (DEMO_MODE) return delay(db().auditLogs, 150);
    return http("/audit-logs");
  },
};

export const systemApi = {
  async stats(): Promise<SystemStats> {
    if (DEMO_MODE) {
      const s = db();
      const total = s.complaints.length;
      const resolved = s.complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
      return delay(
        {
          totalCitizens: s.users.filter((u) => u.role === "CITIZEN").length,
          totalOfficers: s.officers.length,
          totalDepartments: s.departments.length,
          totalComplaints: total,
          resolutionRate: total ? resolved / total : 0,
          slaCompliance:
            s.departments.reduce((sum, d) => sum + d.slaCompliance, 0) / s.departments.length,
          criticalComplaints: s.complaints.filter((c) => c.priority === "CRITICAL").length,
          duplicateComplaints: s.complaints.filter((c) => c.duplicateGroupId).length,
        },
        150,
      );
    }
    return http("/system/stats");
  },
};
