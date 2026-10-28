import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  Layers,
  MapPin,
  PlusCircle,
  ArrowLeft,
  ExternalLink,
  Activity,
  GitCompare,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { api, Building } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/buildings/$id")({
  component: BuildingDetailPage,
});

function BuildingDetailPage() {
  const { id } = useParams({ from: "/buildings/$id" });
  const { t } = useLanguage();
  const [building, setBuilding] = useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const res = await api.getBuilding(Number(id));
        setBuilding(res.building);
      } catch (err) {
        console.warn("Could not load building detail", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuilding();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-12 text-center text-xs text-muted-foreground">Loading building dossier...</div>
      </AppLayout>
    );
  }

  if (!building) {
    return (
      <AppLayout>
        <div className="py-12 text-center">
          <p className="text-sm font-semibold">Building asset not found.</p>
          <Button size="sm" asChild className="mt-4 text-xs">
            <Link to="/buildings">Return to Asset Portfolio</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const inspections = building.inspections || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Back Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link to="/buildings">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{building.name}</h1>
                <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                  {building.identifier}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" /> {building.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="gap-1.5 text-xs font-semibold">
              <Link to="/inspections/new" search={{ buildingId: building.id } as any}>
                <PlusCircle className="h-4 w-4" /> Inspect This Asset
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="gap-1.5 text-xs">
              <Link to="/monitoring">
                <TrendingUp className="h-4 w-4" /> Growth Timeline
              </Link>
            </Button>
          </div>
        </div>

        {/* Structural Specs Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">Structure Type</span>
            <span className="text-base font-bold mt-1 block">{building.buildingType}</span>
          </Card>
          <Card className="p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">Floors / Elevation</span>
            <span className="text-base font-bold mt-1 block">{building.floors} Levels</span>
          </Card>
          <Card className="p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">Year Built</span>
            <span className="text-base font-bold mt-1 block">{building.yearBuilt || "Undisclosed"}</span>
          </Card>
          <Card className="p-4 shadow-xs">
            <span className="text-xs text-muted-foreground block">Monitoring Status</span>
            <Badge
              variant="secondary"
              className={`text-xs mt-1 font-semibold ${
                building.monitoringStatus === "review_needed"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {building.monitoringStatus === "review_needed" ? "Review Advised" : "Active Regular Scan"}
            </Badge>
          </Card>
        </div>

        {building.description && (
          <Card className="p-4 shadow-xs text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground block mb-1">Asset Description & Framing:</span>
            {building.description}
          </Card>
        )}

        {/* Inspection History Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Inspection Scan Dossier</h2>
            <span className="text-xs text-muted-foreground font-mono">{inspections.length} recorded scans</span>
          </div>

          {inspections.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs font-medium">No surface inspections recorded for this asset yet.</p>
              <Button size="sm" asChild className="mt-3 text-xs">
                <Link to="/inspections/new" search={{ buildingId: building.id } as any}>
                  Perform Baseline Inspection
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {inspections.map((insp, index) => (
                <Card key={insp.id} className="p-4 hover:border-primary/50 transition-all shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          Scan #{inspections.length - index}
                        </Badge>
                        <span className="font-bold text-sm text-foreground">
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
                      <p className="text-xs text-muted-foreground">
                        {insp.notes || "Standard scheduled surface photography."}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground/80 font-mono pt-1">
                        <span>Date: {new Date(insp.inspectionDate).toLocaleDateString()}</span>
                        <span>Area: {insp.detectedPixelPercentage.toFixed(3)}%</span>
                        <span>Fissures: {insp.regionCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" asChild className="h-8 text-xs gap-1 text-primary">
                        <Link to="/inspections/$id" params={{ id: String(insp.id) }}>
                          View Analysis <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
