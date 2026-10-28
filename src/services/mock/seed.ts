import type {
  Complaint,
  Department,
  Officer,
  User,
  Notification,
  AuditLog,
  SLARule,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  SlaStatus,
  AIAnalysis,
  TimelineEvent,
} from "@/types";

// Deterministic PRNG for stable seeds
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

const CATEGORIES: ComplaintCategory[] = [
  "Electricity",
  "Water Supply",
  "Sanitation",
  "Roads & Transport",
  "Public Safety",
  "Health",
  "Education",
  "Environment",
  "Housing",
];

const PRIORITIES: ComplaintPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const STATUSES: ComplaintStatus[] = [
  "SUBMITTED",
  "AI_ANALYZED",
  "ASSIGNED",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "RESOLVED",
  "CLOSED",
];

const COMPLAINT_TEMPLATES: {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  reason: string;
}[] = [
  {
    title: "Live electric wire fallen near school entrance",
    description:
      "A high-voltage wire has snapped and is dangling right outside the primary school. Children pass this spot every morning.",
    category: "Electricity",
    priority: "CRITICAL",
    reason: "Potential safety risk to children and pedestrians.",
  },
  {
    title: "No water supply in Sector 12 for 3 days",
    description:
      "Residents of Sector 12 have not received piped water for the last three days. Elderly and children are severely affected.",
    category: "Water Supply",
    priority: "HIGH",
    reason: "Extended disruption affecting a residential block.",
  },
  {
    title: "Overflowing garbage bin near market",
    description:
      "The bin at Main Market Road has not been cleared for a week and is attracting stray animals.",
    category: "Sanitation",
    priority: "MEDIUM",
    reason: "Public hygiene concern in a high-footfall area.",
  },
  {
    title: "Large pothole on MG Road causing accidents",
    description:
      "A deep pothole near the metro station has already caused two two-wheeler accidents this week.",
    category: "Roads & Transport",
    priority: "HIGH",
    reason: "Documented incidents of injury.",
  },
  {
    title: "Street light non-functional in residential lane",
    description:
      "The entire lane behind Green Park has no working street lights for over ten days.",
    category: "Public Safety",
    priority: "MEDIUM",
    reason: "Reduced visibility raises safety risk after dark.",
  },
  {
    title: "Stagnant water breeding mosquitoes",
    description:
      "Construction site adjacent to residences has accumulated stagnant water for weeks.",
    category: "Health",
    priority: "HIGH",
    reason: "Vector-borne disease risk in a residential zone.",
  },
  {
    title: "Broken bench and unsafe playground equipment",
    description:
      "The public park's playground has rusted and broken equipment. A child was injured last weekend.",
    category: "Environment",
    priority: "MEDIUM",
    reason: "Existing injury reported; needs urgent inspection.",
  },
  {
    title: "Illegal dumping of construction debris",
    description:
      "Debris is being dumped on the vacant plot near the community center every night.",
    category: "Environment",
    priority: "LOW",
    reason: "Municipal bylaw violation; ongoing pattern.",
  },
  {
    title: "Transformer sparking in market area",
    description:
      "The transformer near the wholesale market has been sparking loudly for two days.",
    category: "Electricity",
    priority: "CRITICAL",
    reason: "Fire and electrocution hazard in a commercial zone.",
  },
  {
    title: "Blocked drain flooding street",
    description:
      "The main drain near the bus stop is blocked, causing street flooding after every rain.",
    category: "Sanitation",
    priority: "HIGH",
    reason: "Recurring flooding damaging property and vehicles.",
  },
  {
    title: "Damaged school building wall",
    description:
      "A section of the compound wall of the government school has collapsed partially.",
    category: "Education",
    priority: "MEDIUM",
    reason: "Structural risk to students during school hours.",
  },
  {
    title: "Encroachment on public footpath",
    description:
      "Vendors have permanently occupied the footpath on Station Road, forcing pedestrians onto the road.",
    category: "Housing",
    priority: "LOW",
    reason: "Ongoing encroachment; needs verification.",
  },
];

const DEPARTMENTS: Department[] = [
  {
    id: "dept-1",
    name: "Electricity Department",
    code: "ELEC",
    head: "Ms. R. Sharma",
    officerCount: 12,
    totalComplaints: 0,
    resolvedComplaints: 0,
    slaCompliance: 0.86,
    categoriesHandled: ["Electricity"],
  },
  {
    id: "dept-2",
    name: "Water Supply Board",
    code: "WATR",
    head: "Mr. K. Patel",
    officerCount: 9,
    totalComplaints: 0,
    resolvedComplaints: 0,
    slaCompliance: 0.79,
    categoriesHandled: ["Water Supply"],
  },
  {
    id: "dept-3",
    name: "Sanitation & Waste Management",
    code: "SANI",
    head: "Ms. A. Iyer",
    officerCount: 15,
    totalComplaints: 0,
    resolvedComplaints: 0,
    slaCompliance: 0.72,
    categoriesHandled: ["Sanitation", "Environment"],
  },
  {
    id: "dept-4",
    name: "Public Works & Roads",
    code: "PWD",
    head: "Mr. S. Kumar",
    officerCount: 18,
    totalComplaints: 0,
    resolvedComplaints: 0,
    slaCompliance: 0.68,
    categoriesHandled: ["Roads & Transport", "Housing"],
  },
  {
    id: "dept-5",
    name: "Public Health & Safety",
    code: "PHSD",
    head: "Dr. N. Rao",
    officerCount: 11,
    totalComplaints: 0,
    resolvedComplaints: 0,
    slaCompliance: 0.81,
    categoriesHandled: ["Health", "Public Safety", "Education"],
  },
];

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

const OFFICERS: Officer[] = [
  { id: "off-1", fullName: "Anil Verma", email: "anil.verma@asgip.gov", departmentId: "dept-1", departmentName: "Electricity Department", activeComplaints: 7, resolvedComplaints: 42, avgResolutionHours: 18, isActive: true },
  { id: "off-2", fullName: "Priya Nair", email: "priya.nair@asgip.gov", departmentId: "dept-2", departmentName: "Water Supply Board", activeComplaints: 5, resolvedComplaints: 31, avgResolutionHours: 22, isActive: true },
  { id: "off-3", fullName: "Rohit Singh", email: "rohit.singh@asgip.gov", departmentId: "dept-3", departmentName: "Sanitation & Waste Management", activeComplaints: 9, resolvedComplaints: 58, avgResolutionHours: 30, isActive: true },
  { id: "off-4", fullName: "Meera Joshi", email: "meera.joshi@asgip.gov", departmentId: "dept-4", departmentName: "Public Works & Roads", activeComplaints: 11, resolvedComplaints: 47, avgResolutionHours: 48, isActive: true },
  { id: "off-5", fullName: "Kiran Das", email: "kiran.das@asgip.gov", departmentId: "dept-5", departmentName: "Public Health & Safety", activeComplaints: 4, resolvedComplaints: 36, avgResolutionHours: 20, isActive: true },
  { id: "off-6", fullName: "Suresh Rao", email: "suresh.rao@asgip.gov", departmentId: "dept-1", departmentName: "Electricity Department", activeComplaints: 6, resolvedComplaints: 39, avgResolutionHours: 16, isActive: true },
  { id: "off-7", fullName: "Farah Khan", email: "farah.khan@asgip.gov", departmentId: "dept-3", departmentName: "Sanitation & Waste Management", activeComplaints: 8, resolvedComplaints: 44, avgResolutionHours: 28, isActive: true },
  { id: "off-8", fullName: "Vikas Menon", email: "vikas.menon@asgip.gov", departmentId: "dept-4", departmentName: "Public Works & Roads", activeComplaints: 12, resolvedComplaints: 52, avgResolutionHours: 44, isActive: false },
];

const CITIZENS: User[] = [
  { id: "cit-1", fullName: "Demo Citizen", email: "citizen@asgip.gov", phone: "+91 90000 00001", role: "CITIZEN", isActive: true, createdAt: "2025-11-10T10:00:00Z" },
  { id: "cit-2", fullName: "Rahul Gupta", email: "rahul@example.com", phone: "+91 90000 00002", role: "CITIZEN", isActive: true, createdAt: "2025-12-01T10:00:00Z" },
  { id: "cit-3", fullName: "Sunita Devi", email: "sunita@example.com", phone: "+91 90000 00003", role: "CITIZEN", isActive: true, createdAt: "2026-01-05T10:00:00Z" },
];

const USERS: User[] = [
  ...CITIZENS,
  { id: "usr-officer", fullName: "Demo Officer", email: "officer@asgip.gov", phone: "+91 90000 10001", role: "OFFICER", departmentId: "dept-1", isActive: true, createdAt: "2025-08-01T10:00:00Z" },
  { id: "usr-dept", fullName: "Demo Dept. Admin", email: "dept@asgip.gov", phone: "+91 90000 20001", role: "DEPARTMENT_ADMIN", departmentId: "dept-3", isActive: true, createdAt: "2025-07-01T10:00:00Z" },
  { id: "usr-admin", fullName: "Demo Super Admin", email: "admin@asgip.gov", phone: "+91 90000 30001", role: "SUPER_ADMIN", isActive: true, createdAt: "2025-06-01T10:00:00Z" },
  ...OFFICERS.map<User>((o) => ({
    id: `usr-${o.id}`,
    fullName: o.fullName,
    email: o.email,
    role: "OFFICER",
    departmentId: o.departmentId,
    isActive: o.isActive,
    createdAt: "2025-08-01T10:00:00Z",
  })),
];

// Delhi-ish center
const CITY_CENTER = { lat: 28.6139, lng: 77.209 };

function randomLocation(i: number) {
  const dLat = (rand() - 0.5) * 0.15;
  const dLng = (rand() - 0.5) * 0.2;
  return {
    address: `${100 + i} ${pick(["MG Road", "Station Road", "Ring Road", "Park Street", "Main Bazaar", "Nehru Nagar"])}, ${pick(["Sector 12", "Sector 22", "Rajouri", "Karol Bagh", "Saket", "Dwarka"])}`,
    lat: CITY_CENTER.lat + dLat,
    lng: CITY_CENTER.lng + dLng,
    ward: `Ward ${1 + Math.floor(rand() * 40)}`,
    city: "New Delhi",
  };
}

function buildAI(template: (typeof COMPLAINT_TEMPLATES)[number], duplicate: boolean, similarIds: string[]): AIAnalysis {
  return {
    category: template.category,
    confidence: 0.82 + rand() * 0.17,
    priority: template.priority,
    urgencyScore: {
      CRITICAL: 90 + Math.floor(rand() * 10),
      HIGH: 70 + Math.floor(rand() * 20),
      MEDIUM: 40 + Math.floor(rand() * 25),
      LOW: 15 + Math.floor(rand() * 20),
    }[template.priority],
    reason: template.reason,
    recommendedDepartmentId: CATEGORY_TO_DEPT[template.category],
    recommendedDepartmentName: DEPARTMENTS.find((d) => d.id === CATEGORY_TO_DEPT[template.category])!.name,
    duplicateProbability: duplicate ? 0.7 + rand() * 0.25 : rand() * 0.3,
    similarComplaintIds: similarIds,
    keywords: template.title.toLowerCase().split(/\s+/).slice(0, 5),
    sentiment: "negative",
    analyzedAt: new Date(Date.now() - Math.floor(rand() * 1000 * 60 * 60 * 24 * 5)).toISOString(),
  };
}

function slaFor(priority: ComplaintPriority): number {
  return { CRITICAL: 6, HIGH: 24, MEDIUM: 72, LOW: 168 }[priority];
}

function buildTimeline(status: ComplaintStatus, createdAt: Date, officerName: string): TimelineEvent[] {
  const t: TimelineEvent[] = [];
  const push = (offsetH: number, s: ComplaintStatus, actor: string, actorRole: TimelineEvent["actorRole"], desc: string) => {
    t.push({
      id: `evt-${t.length}-${createdAt.getTime()}`,
      status: s,
      actor,
      actorRole,
      description: desc,
      timestamp: new Date(createdAt.getTime() + offsetH * 3600 * 1000).toISOString(),
    });
  };
  push(0, "SUBMITTED", "Citizen", "CITIZEN", "Complaint submitted by citizen.");
  push(0.05, "AI_ANALYZED", "ASGIP AI", "SYSTEM", "AI classified, prioritized and recommended department.");
  const order: ComplaintStatus[] = ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  for (let i = 0; i < order.length; i++) {
    const s = order[i];
    if (STATUSES.indexOf(status) >= STATUSES.indexOf(s)) {
      push(1 + i * 6, s, officerName, "OFFICER",
        s === "ASSIGNED" ? "Assigned to responsible officer."
          : s === "IN_PROGRESS" ? "Officer began on-site inspection."
          : s === "RESOLVED" ? "Issue resolved. Awaiting citizen confirmation."
          : "Complaint closed after citizen confirmation.");
    }
  }
  return t;
}

function buildComplaints(): Complaint[] {
  const list: Complaint[] = [];
  const now = Date.now();
  for (let i = 0; i < 42; i++) {
    const tpl = COMPLAINT_TEMPLATES[i % COMPLAINT_TEMPLATES.length];
    const createdOffsetH = Math.floor(rand() * 24 * 20);
    const createdAt = new Date(now - createdOffsetH * 3600 * 1000);
    const status = STATUSES[Math.min(STATUSES.length - 1, Math.floor(rand() * STATUSES.length))];
    const priority = tpl.priority;
    const slaHours = slaFor(priority);
    const expected = new Date(createdAt.getTime() + slaHours * 3600 * 1000);
    const isResolved = status === "RESOLVED" || status === "CLOSED";
    const resolvedAt = isResolved ? new Date(createdAt.getTime() + slaHours * 0.7 * 3600 * 1000).toISOString() : undefined;
    let slaStatus: SlaStatus = "ON_TRACK";
    if (isResolved) slaStatus = "ON_TRACK";
    else if (now > expected.getTime()) slaStatus = "OVERDUE";
    else if (now > expected.getTime() - slaHours * 0.25 * 3600 * 1000) slaStatus = "AT_RISK";
    const officer = OFFICERS.find((o) => o.departmentId === CATEGORY_TO_DEPT[tpl.category]) || OFFICERS[0];
    const dupe = rand() < 0.2;
    const similar = dupe ? [`GRV-2026-${String(1 + Math.floor(rand() * 40)).padStart(6, "0")}`] : [];
    const code = `GRV-2026-${String(i + 1).padStart(6, "0")}`;
    const citizen = pick(CITIZENS);
    list.push({
      id: `cmp-${i + 1}`,
      code,
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      priority,
      status,
      location: randomLocation(i),
      evidence:
        rand() < 0.6
          ? [
              {
                id: `ev-${i}`,
                url: `https://images.unsplash.com/photo-15${(60 + i) % 99}000000000-abc?w=800`,
                name: "site-photo.jpg",
                type: "image",
              },
            ]
          : [],
      citizenId: citizen.id,
      citizenName: citizen.fullName,
      departmentId: CATEGORY_TO_DEPT[tpl.category],
      departmentName: DEPARTMENTS.find((d) => d.id === CATEGORY_TO_DEPT[tpl.category])!.name,
      officerId: officer.id,
      officerName: officer.fullName,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      expectedResolutionAt: expected.toISOString(),
      resolvedAt,
      slaStatus,
      aiAnalysis: buildAI(tpl, dupe, similar),
      duplicateGroupId: dupe ? `dg-${i}` : undefined,
      timeline: buildTimeline(status, createdAt, officer.fullName),
    });
  }
  // Update department totals
  for (const d of DEPARTMENTS) {
    const dc = list.filter((c) => c.departmentId === d.id);
    d.totalComplaints = dc.length;
    d.resolvedComplaints = dc.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
  }
  return list;
}

const NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "cit-1", type: "STATUS_UPDATED", title: "Complaint updated", message: "Your complaint GRV-2026-000001 moved to In Progress.", complaintId: "cmp-1", read: false, createdAt: new Date(Date.now() - 3600e3).toISOString() },
  { id: "n2", userId: "cit-1", type: "COMPLAINT_ASSIGNED", title: "Officer assigned", message: "GRV-2026-000003 assigned to Anil Verma.", complaintId: "cmp-3", read: false, createdAt: new Date(Date.now() - 2 * 3600e3).toISOString() },
  { id: "n3", userId: "usr-officer", type: "SLA_WARNING", title: "SLA at risk", message: "GRV-2026-000004 approaching SLA deadline.", complaintId: "cmp-4", read: false, createdAt: new Date(Date.now() - 6 * 3600e3).toISOString() },
  { id: "n4", userId: "usr-officer", type: "ESCALATION", title: "Complaint escalated", message: "Critical complaint GRV-2026-000009 has been escalated.", complaintId: "cmp-9", read: true, createdAt: new Date(Date.now() - 24 * 3600e3).toISOString() },
  { id: "n5", userId: "usr-dept", type: "DUPLICATE_DETECTED", title: "Potential duplicates", message: "3 complaints detected as potential duplicates today.", read: false, createdAt: new Date(Date.now() - 30 * 60e3).toISOString() },
];

const AUDIT_LOGS: AuditLog[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `al-${i}`,
  timestamp: new Date(Date.now() - i * 3600e3 * 2).toISOString(),
  userId: pick(USERS).id,
  userName: pick(USERS).fullName,
  userRole: pick(["OFFICER", "DEPARTMENT_ADMIN", "SUPER_ADMIN"] as const),
  action: pick(["CREATE", "UPDATE", "ASSIGN", "ESCALATE", "RESOLVE", "LOGIN"]),
  entity: pick(["Complaint", "User", "Department", "SLA"]),
  entityId: `ent-${i}`,
  description: pick([
    "Updated complaint status",
    "Assigned officer to complaint",
    "Modified SLA rule",
    "User logged in",
    "Escalated complaint to department admin",
  ]),
}));

const SLA_RULES: SLARule[] = [
  { priority: "CRITICAL", resolutionHours: 6, firstResponseHours: 1, escalationHours: 4, escalateTo: "DEPARTMENT_ADMIN" },
  { priority: "HIGH", resolutionHours: 24, firstResponseHours: 4, escalationHours: 16, escalateTo: "DEPARTMENT_ADMIN" },
  { priority: "MEDIUM", resolutionHours: 72, firstResponseHours: 12, escalationHours: 48, escalateTo: "OFFICER" },
  { priority: "LOW", resolutionHours: 168, firstResponseHours: 24, escalationHours: 120, escalateTo: "OFFICER" },
];

// Lazy singleton (avoid Cloudflare "global scope" errors + hydration)
let _state: {
  users: User[];
  officers: Officer[];
  departments: Department[];
  complaints: Complaint[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  slaRules: SLARule[];
} | null = null;

export function db() {
  if (!_state) {
    _state = {
      users: [...USERS],
      officers: [...OFFICERS],
      departments: [...DEPARTMENTS],
      complaints: buildComplaints(),
      notifications: [...NOTIFICATIONS],
      auditLogs: [...AUDIT_LOGS],
      slaRules: [...SLA_RULES],
    };
  }
  return _state;
}

export const DEMO_ACCOUNTS = [
  { role: "CITIZEN" as const, email: "citizen@asgip.gov", password: "demo" },
  { role: "OFFICER" as const, email: "officer@asgip.gov", password: "demo" },
  { role: "DEPARTMENT_ADMIN" as const, email: "dept@asgip.gov", password: "demo" },
  { role: "SUPER_ADMIN" as const, email: "admin@asgip.gov", password: "demo" },
];
