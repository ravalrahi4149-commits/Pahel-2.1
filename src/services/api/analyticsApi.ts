import { DEMO_MODE } from "@/lib/env";
import { db } from "@/services/mock/seed";
import { delay, http } from "./http";
import type { Analytics, ComplaintPriority } from "@/types";

export const analyticsApi = {
  async overview(departmentId?: string): Promise<Analytics> {
    if (DEMO_MODE) {
      const s = db();
      const complaints = departmentId
        ? s.complaints.filter((c) => c.departmentId === departmentId)
        : s.complaints;
      const total = complaints.length;
      const resolved = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
      const pending = complaints.filter((c) => c.status === "SUBMITTED" || c.status === "AI_ANALYZED" || c.status === "ASSIGNED").length;
      const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS" || c.status === "AWAITING_INFO").length;
      const overdue = complaints.filter((c) => c.slaStatus === "OVERDUE").length;

      const byCategoryMap = new Map<string, number>();
      complaints.forEach((c) => byCategoryMap.set(c.category, (byCategoryMap.get(c.category) || 0) + 1));
      const byCategory = Array.from(byCategoryMap.entries()).map(([category, count]) => ({ category, count }));

      const byPriorityMap = new Map<ComplaintPriority, number>();
      complaints.forEach((c) => byPriorityMap.set(c.priority, (byPriorityMap.get(c.priority) || 0) + 1));
      const byPriority = (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as ComplaintPriority[]).map((p) => ({
        priority: p,
        count: byPriorityMap.get(p) || 0,
      }));

      const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
      const monthlyTrend = months.map((m, i) => ({
        month: m,
        submitted: 40 + Math.floor(Math.sin(i) * 15 + i * 8) + (departmentId ? 0 : 20),
        resolved: 30 + Math.floor(Math.cos(i) * 10 + i * 7) + (departmentId ? 0 : 15),
      }));

      const resolutionPerformance = s.departments.map((d) => ({
        department: d.code,
        resolved: d.resolvedComplaints,
        overdue: s.complaints.filter((c) => c.departmentId === d.id && c.slaStatus === "OVERDUE").length,
      }));

      return delay(
        {
          totalComplaints: total,
          pending,
          inProgress,
          resolved,
          overdue,
          slaCompliance: total ? Math.max(0, (total - overdue) / total) : 1,
          avgResolutionHours: 28,
          byCategory,
          byPriority,
          monthlyTrend,
          resolutionPerformance,
        },
        200,
      );
    }
    return http(`/analytics${departmentId ? `?departmentId=${departmentId}` : ""}`);
  },
};
