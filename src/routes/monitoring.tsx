import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Building2,
  Calendar,
  AlertTriangle,
  Download,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { api, Building, Inspection } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/monitoring")({
  component: GrowthMonitoringPage,
});

function GrowthMonitoringPage() {
  const { t } = useLanguage();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load buildings
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await api.getBuildings();
        const blds = res.buildings || [];
        setBuildings(blds);
        if (blds.length > 0) {
          setSelectedBuildingId(String(blds[0].id));
        }
      } catch (err) {}
    };
    fetchBuildings();
  }, []);

  // When building changes, fetch its chronological inspections
  useEffect(() => {
    if (!selectedBuildingId) return;
    const fetchInspections = async () => {
      setIsLoading(true);
      try {
        const res = await api.getInspections({ buildingId: Number(selectedBuildingId) });
        // Chronological order (oldest first for trend line)
        const sorted = (res.inspections || []).sort(
          (a, b) => new Date(a.inspectionDate).getTime() - new Date(b.inspectionDate).getTime()
        );
        setInspections(sorted);
      } catch (err) {}
      finally {
        setIsLoading(false);
      }
    };
    fetchInspections();
  }, [selectedBuildingId]);

  const selectedBuilding = buildings.find((b) => String(b.id) === selectedBuildingId);

  // Prepare chart dataset
  const chartData = inspections.map((insp, idx) => ({
    scanNumber: `#${idx + 1}`,
    date: new Date(insp.inspectionDate).toLocaleDateString([], { month: "short", day: "numeric" }),
    fullDate: new Date(insp.inspectionDate).toLocaleDateString(),
    location: insp.location,
    areaPct: Number(insp.detectedPixelPercentage.toFixed(3)),
    regionCount: insp.regionCount,
    status: insp.reviewStatus,
  }));

  // Calculate net longitudinal delta if >= 2 inspections
  let netDelta = 0;
  let hasGrowth = false;
  if (inspections.length >= 2) {
    const first = inspections[0].detectedPixelPercentage;
    const last = inspections[inspections.length - 1].detectedPixelPercentage;
    netDelta = last - first;
    hasGrowth = netDelta > 0.05;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("growthMonitoring")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Longitudinal track record of crack surface expansion, stabilization, and engineering alerts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
              <SelectTrigger className="w-64 text-xs font-semibold h-9">
                <SelectValue placeholder="Select building asset..." />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {buildings.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" asChild variant="outline" className="gap-1.5 text-xs h-9">
              <a href={api.getInspectionsCsvUrl()} download>
                <Download className="h-4 w-4" /> Export CSV
              </a>
            </Button>
          </div>
        </div>

        {/* Growth Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">Asset Monitored</span>
            <span className="text-sm font-bold mt-1 block truncate">
              {selectedBuilding?.name || "Asset"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono block">
              {selectedBuilding?.identifier}
            </span>
          </Card>

          <Card className="p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">Total Longitudinal Scans</span>
            <span className="text-2xl font-bold font-mono mt-1 block">
              {inspections.length}
            </span>
            <span className="text-[10px] text-muted-foreground block">Periodic time points</span>
          </Card>

          <Card className="p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">Net Area Trajectory</span>
            <span
              className={`text-2xl font-bold font-mono mt-1 block ${
                hasGrowth ? "text-amber-500" : netDelta < -0.05 ? "text-emerald-500" : "text-foreground"
              }`}
            >
              {netDelta >= 0 ? `+${netDelta.toFixed(3)}` : netDelta.toFixed(3)}% pts
            </span>
            <span className="text-[10px] text-muted-foreground block">From initial baseline</span>
          </Card>

          <Card className="p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">Cadence Recommendation</span>
            <span className="text-sm font-bold mt-1 block text-sky-500">
              {hasGrowth ? "30-Day Follow-Up" : "90-Day Standard"}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {hasGrowth ? "Elongation detected" : "Fissure stabilized"}
            </span>
          </Card>
        </div>

        {/* Longitudinal Trajectory Chart */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t("growthTrend")}
              </CardTitle>
              <CardDescription className="text-xs">
                Detected crack pixel area % tracked across periodic inspection dates
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              Y-Axis: Pixel Area %
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
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
                      formatter={(val: any) => [`${Number(val).toFixed(3)}%`, "Crack Density"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="areaPct"
                      stroke="#06B6D4"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#growthGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No longitudinal inspection points for this asset yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chronological Observation Log */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Chronological Surface Observations</CardTitle>
            <CardDescription className="text-xs">
              Every documented scan point with human review validation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inspections.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No inspection entries available.
              </div>
            ) : (
              <div className="space-y-3">
                {inspections.map((insp, idx) => (
                  <div
                    key={insp.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border/70 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          T{idx + 1}
                        </Badge>
                        <span className="font-bold text-xs">
                          {insp.surfaceType} • {insp.location}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            insp.reviewStatus === "requires_qualified_review"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {insp.reviewStatus.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {insp.reviewerNotes || insp.notes || "Standard inspection capture."}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/80 font-mono">
                        <span>Date: {new Date(insp.inspectionDate).toLocaleDateString()}</span>
                        <span>Density: {insp.detectedPixelPercentage.toFixed(3)}%</span>
                        <span>Regions: {insp.regionCount}</span>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" asChild className="h-8 text-xs font-semibold text-primary">
                      <Link to="/inspections/$id" params={{ id: String(insp.id) }}>
                        View Dossier <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
