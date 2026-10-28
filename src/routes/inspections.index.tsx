import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  Trash2,
  GitCompare,
  Download,
  Calendar,
  Layers,
  MapPin,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { api, Inspection, Building } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/inspections/")({
  component: InspectionHistoryPage,
});

function InspectionHistoryPage() {
  const { t } = useLanguage();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [selectedSurfaceType, setSelectedSurfaceType] = useState<string>("all");
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInspections({
        buildingId: selectedBuildingId !== "all" ? Number(selectedBuildingId) : undefined,
        surfaceType: selectedSurfaceType !== "all" ? selectedSurfaceType : undefined,
        reviewStatus: selectedReviewStatus !== "all" ? selectedReviewStatus : undefined,
      });
      setInspections(res.inspections || []);
    } catch (err) {
      console.warn("Could not load inspections", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const res = await api.getBuildings();
        setBuildings(res.buildings || []);
      } catch (err) {}
    };
    loadBuildings();
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [selectedBuildingId, selectedSurfaceType, selectedReviewStatus]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this inspection record and generated overlays?")) {
      return;
    }
    try {
      await api.deleteInspection(id);
      fetchInspections();
    } catch (err) {
      alert("Failed to delete inspection.");
    }
  };

  const filteredInspections = inspections.filter((i) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.buildingName?.toLowerCase().includes(s) ||
      i.location.toLowerCase().includes(s) ||
      i.notes?.toLowerCase().includes(s) ||
      i.surfaceType.toLowerCase().includes(s)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("inspectionHistory")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive repository of historical crack detection scans, overlays, and annotations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="gap-1.5 text-xs font-semibold">
              <Link to="/inspections/new">
                <PlusCircle className="h-4 w-4" /> {t("newInspection")}
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="gap-1.5 text-xs">
              <a href={api.getInspectionsCsvUrl()} download>
                <Download className="h-4 w-4" /> Export CSV
              </a>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location, notes..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue placeholder="All Building Assets" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Building Assets</SelectItem>
              {buildings.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSurfaceType} onValueChange={setSelectedSurfaceType}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue placeholder="All Surface Types" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Surface Types</SelectItem>
              <SelectItem value="Wall">Wall Surface</SelectItem>
              <SelectItem value="Beam Surface">Beam Surface</SelectItem>
              <SelectItem value="Column Surface">Column Surface</SelectItem>
              <SelectItem value="Ceiling">Ceiling Surface</SelectItem>
              <SelectItem value="Slab Surface">Slab Surface</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedReviewStatus} onValueChange={setSelectedReviewStatus}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue placeholder="All Review Statuses" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Review Statuses</SelectItem>
              <SelectItem value="verified_record">Verified Record</SelectItem>
              <SelectItem value="requires_qualified_review">Review Required</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Inspection List / Cards */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading inspections...</div>
        ) : filteredInspections.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Layers className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-semibold">{t("emptyState")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a new surface scan to start tracking fissure developments.
            </p>
            <Button size="sm" asChild className="mt-4 text-xs">
              <Link to="/inspections/new">{t("startInspectionCta")}</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInspections.map((insp) => (
              <Card
                key={insp.id}
                className="hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden shadow-xs"
              >
                {/* Image Preview Thumbnail */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={api.getImageUrl(insp.overlayImageUrl || insp.originalImageUrl)}
                    alt="Scan thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <Badge variant="secondary" className="text-[10px] bg-slate-950/80 backdrop-blur font-mono text-cyan-400">
                      {insp.detectedPixelPercentage.toFixed(2)}% area
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-slate-950/80 backdrop-blur font-mono text-amber-400">
                      {insp.regionCount} fissures
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] backdrop-blur font-semibold ${
                        insp.reviewStatus === "requires_qualified_review"
                          ? "bg-amber-950/90 text-amber-300 border border-amber-600/40"
                          : insp.reviewStatus === "verified_record"
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-600/40"
                          : "bg-slate-900/90 text-slate-300"
                      }`}
                    >
                      {insp.reviewStatus.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                    {insp.buildingName || "Asset"}
                  </span>
                  <CardTitle className="text-sm font-bold truncate">
                    {insp.surfaceType} • {insp.location}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-1 mt-0.5">
                    {insp.notes || "Field inspection photograph"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-4 pb-3 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span className="font-mono text-foreground">
                      {new Date(insp.inspectionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="truncate max-w-[170px]">{insp.detectionMethod}</span>
                  </div>
                </CardContent>

                <div className="border-t border-border/80 px-4 py-2.5 bg-muted/20 flex items-center justify-between">
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold gap-1 text-primary">
                    <Link to="/inspections/$id" params={{ id: String(insp.id) }}>
                      {t("viewDetails")} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Download PDF"
                    >
                      <a href={api.getInspectionPdfUrl(insp.id)} download target="_blank" rel="noreferrer">
                        <FileText className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(insp.id, e)}
                      title="Delete Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
