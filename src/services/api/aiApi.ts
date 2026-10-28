import { DEMO_MODE } from "@/lib/env";
import { db } from "@/services/mock/seed";
import { delay, http } from "./http";
import type { AIAnalysis, ComplaintCategory, ComplaintPriority } from "@/types";

const KEYWORDS: { keys: string[]; category: ComplaintCategory; priority: ComplaintPriority; reason: string }[] = [
  { keys: ["electric", "wire", "transformer", "power", "electrocut", "spark"], category: "Electricity", priority: "CRITICAL", reason: "Electrical safety hazard detected in description." },
  { keys: ["water", "leak", "supply", "tap", "pipeline"], category: "Water Supply", priority: "HIGH", reason: "Extended water supply disruption pattern." },
  { keys: ["garbage", "waste", "trash", "sewage", "drain", "sanit"], category: "Sanitation", priority: "MEDIUM", reason: "Public sanitation concern in populated area." },
  { keys: ["pothole", "road", "traffic", "signal", "footpath"], category: "Roads & Transport", priority: "HIGH", reason: "Road hazard with public-safety implications." },
  { keys: ["mosquito", "dengue", "malaria", "health", "hospital", "clinic"], category: "Health", priority: "HIGH", reason: "Public health risk indicators present." },
  { keys: ["school", "teacher", "student", "education"], category: "Education", priority: "MEDIUM", reason: "Education-related concern affecting students." },
  { keys: ["safety", "streetlight", "light", "dark"], category: "Public Safety", priority: "MEDIUM", reason: "Public safety indicator identified." },
  { keys: ["tree", "park", "pollution", "noise", "environment"], category: "Environment", priority: "LOW", reason: "Environmental concern flagged." },
  { keys: ["housing", "encroachment", "building"], category: "Housing", priority: "LOW", reason: "Property or housing-related issue." },
];

function classify(text: string): { category: ComplaintCategory; priority: ComplaintPriority; reason: string; score: number } {
  const t = text.toLowerCase();
  let best = { category: "Other" as ComplaintCategory, priority: "MEDIUM" as ComplaintPriority, reason: "Insufficient keywords — routed to general triage.", score: 0.55 };
  for (const rule of KEYWORDS) {
    const hits = rule.keys.filter((k) => t.includes(k)).length;
    if (hits > 0) {
      const score = Math.min(0.99, 0.75 + hits * 0.06);
      if (score > best.score) best = { category: rule.category, priority: rule.priority, reason: rule.reason, score };
    }
  }
  // Escalate priority on strong signals
  if (/school|children|hospital|fire|urgent|danger|emergency/.test(t)) {
    best.priority = "CRITICAL";
    best.reason += " Vulnerable-population signals raise priority.";
  }
  return best;
}

const CATEGORY_TO_DEPT: Record<ComplaintCategory, string> = {
  Electricity: "dept-1",
  "Water Supply": "dept-2",
  Sanitation: "dept-3",
  Environment: "dept-3",
  "Roads & Transport": "dept-4",
  Housing: "dept-4",
  Health: "dept-5",
  "Public Safety": "dept-5",
  Education: "dept-5",
  Other: "dept-3",
};

export const aiApi = {
  async analyze(title: string, description: string): Promise<AIAnalysis> {
    if (DEMO_MODE) {
      const { category, priority, reason, score } = classify(`${title} ${description}`);
      const dept = db().departments.find((d) => d.id === CATEGORY_TO_DEPT[category])!;
      // Find similar complaints
      const words = (title + " " + description).toLowerCase().split(/\W+/).filter((w) => w.length > 4);
      const similar = db()
        .complaints.filter((c) => {
          const t = (c.title + " " + c.description).toLowerCase();
          const hits = words.filter((w) => t.includes(w)).length;
          return hits >= 2 && c.category === category;
        })
        .slice(0, 4);
      const dupProb = similar.length ? Math.min(0.95, 0.5 + similar.length * 0.12) : 0.08;
      const urgency =
        priority === "CRITICAL" ? 92 : priority === "HIGH" ? 75 : priority === "MEDIUM" ? 55 : 25;
      return delay(
        {
          category,
          confidence: score,
          priority,
          urgencyScore: urgency,
          reason,
          recommendedDepartmentId: dept.id,
          recommendedDepartmentName: dept.name,
          duplicateProbability: dupProb,
          similarComplaintIds: similar.map((s) => s.code),
          keywords: words.slice(0, 6),
          sentiment: "negative",
          analyzedAt: new Date().toISOString(),
        },
        800,
      );
    }
    return http<AIAnalysis>("/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
  },
};
