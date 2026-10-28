import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Building2,
  FileCheck2,
  AlertTriangle,
  Activity,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  Calendar,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { api, DashboardStats } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const PIE_COLORS = ["#0284C7", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6"];

function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.warn("Could not fetch real dashboard stats; using fallback state", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {t("dashboard")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live structural diagnostic metrics and longitudinal crack activity
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button size="sm" asChild className="gap-1.5 text-xs font-semibold shadow-xs">
              <Link to="/inspections/new">
                <PlusCircle className="h-3.5 w-3.5" />
                {t("newInspection")}
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="gap-1.5 text-xs">
              <Link to="/compare">
                <Activity className="h-3.5 w-3.5" />
                {t("compareInspections")}
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Buildings */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {t("totalBuildings")}
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {isLoading ? "—" : stats?.totalBuildings || 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Monitored physical assets
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total Inspections */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {t("totalInspections")}
              </CardTitle>
              <FileCheck2 className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {isLoading ? "—" : stats?.totalInspections || 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Completed scans & evaluations
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Requiring Review */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {t("reviewNeeded")}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {isLoading ? "—" : stats?.reviewNeededCount || 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Exceeded threshold or unverified
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Average Crack Area Density */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {t("avgCrackArea")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {isLoading ? "—" : `${(stats?.averageCrackAreaPct || 0).toFixed(2)}%`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Mean surface pixel coverage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Trend Line / Area Chart */}
          <Card className="lg:col-span-8 border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">
                    {t("trendTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Historical detected crack pixel percentage across scans
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Pixel Area %
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                {stats?.trendTimeline && stats.trendTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trendTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "8px",
                          border: "1px solid #334155",
                          fontSize: "12px",
                          color: "#F8FAFC",
                        }}
                        formatter={(val: any) => [`${Number(val).toFixed(3)}%`, "Detected Crack Area"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="detectedAreaPct"
                        stroke="#0EA5E9"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#areaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No trend records available yet. Start by uploading an inspection.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Surface Distribution Pie Chart */}
          <Card className="lg:col-span-4 border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">
                Surface Type Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Structural elements evaluated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-44 w-full flex items-center justify-center">
                {stats?.surfaceDistribution && stats.surfaceDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.surfaceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.surfaceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "8px",
                          border: "1px solid #334155",
                          fontSize: "12px",
                          color: "#F8FAFC",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-muted-foreground">No surface data</div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap gap-2 justify-center text-[11px] text-muted-foreground">
                {stats?.surfaceDistribution?.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inspections Table */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">{t("recentActivity")}</CardTitle>
              <CardDescription className="text-xs">
                Latest surface scans submitted across facilities
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
              <Link to="/inspections">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentInspections && stats.recentInspections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/70 text-muted-foreground font-medium">
                    <tr>
                      <th className="pb-2.5 font-semibold">Asset Name</th>
                      <th className="pb-2.5 font-semibold">Location / Surface</th>
                      <th className="pb-2.5 font-semibold">Date</th>
                      <th className="pb-2.5 font-semibold">Detected Area</th>
                      <th className="pb-2.5 font-semibold">Regions</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {stats.recentInspections.map((insp) => (
                      <tr key={insp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium">{insp.buildingName || "Asset"}</td>
                        <td className="py-2.5 text-muted-foreground">{insp.surfaceType} • {insp.location}</td>
                        <td className="py-2.5 text-muted-foreground font-mono">
                          {new Date(insp.inspectionDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 font-mono">
                          {insp.detectedPixelPercentage.toFixed(2)}%
                        </td>
                        <td className="py-2.5 font-mono">{insp.regionCount}</td>
                        <td className="py-2.5">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-medium ${
                              insp.reviewStatus === "requires_qualified_review"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : insp.reviewStatus === "verified_record"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {insp.reviewStatus.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right">
                          <Button size="sm" variant="ghost" asChild className="h-7 text-xs px-2 gap-1 text-primary">
                            <Link to="/inspections/$id" params={{ id: String(insp.id) }}>
                              Inspect <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent inspections recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
