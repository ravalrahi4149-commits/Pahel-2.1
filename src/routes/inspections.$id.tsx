import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Scale,
  Clock,
  Edit3,
  GitCompare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { ImageComparisonViewer } from "@/components/ImageComparisonViewer";
import { api, Inspection } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/inspections/$id")({
  component: InspectionDetailPage,
});

function InspectionDetailPage() {
  const { id } = useParams({ from: "/inspections/$id" });
  const { t } = useLanguage();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review workflow edit state
  const [reviewStatus, setReviewStatus] = useState<string>("pending_review");
  const [reviewerNotes, setReviewerNotes] = useState<string>("");
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const res = await api.getInspection(Number(id));
        setInspection(res.inspection);
        setReviewStatus(res.inspection.reviewStatus);
        setReviewerNotes(res.inspection.reviewerNotes || "");
      } catch (err) {
        console.warn("Could not fetch inspection detail", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInspection();
  }, [id]);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspection) return;
    setIsSavingReview(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateInspectionReview(inspection.id, {
        reviewStatus,
        reviewerNotes,
      });
      setInspection(res.inspection);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update inspection review.");
    } finally {
      setIsSavingReview(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-12 text-center text-xs text-muted-foreground">Loading inspection analysis dossier...</div>
      </AppLayout>
    );
  }

  if (!inspection) {
    return (
      <AppLayout>
        <div className="py-12 text-center">
          <p className="text-sm font-semibold">Inspection record not found.</p>
          <Button size="sm" asChild className="mt-4 text-xs">
            <Link to="/inspections">Back to Inspection History</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link to="/inspections">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {inspection.surfaceType} Scan Analysis
                </h1>
                <Badge variant="outline" className="text-xs font-mono">
                  ID: #{inspection.id}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-foreground">{inspection.buildingName}</span>
                <span>•</span>
                <span>{inspection.location}</span>
                <span>•</span>
                <span>{new Date(inspection.inspectionDate).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="gap-1.5 text-xs font-semibold shadow-xs">
              <a href={api.getInspectionPdfUrl(inspection.id)} download target="_blank" rel="noreferrer">
                <FileText className="h-4 w-4" /> {t("downloadReport")}
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild className="gap-1.5 text-xs">
              <Link to="/compare">
                <GitCompare className="h-4 w-4" /> Compare Scan
              </Link>
            </Button>
          </div>
        </div>

        {/* Interactive Multi-Mode Image Comparison Viewer */}
        <ImageComparisonViewer
          originalUrl={api.getImageUrl(inspection.originalImageUrl)}
          overlayUrl={inspection.overlayImageUrl ? api.getImageUrl(inspection.overlayImageUrl) : undefined}
          maskUrl={inspection.maskImageUrl ? api.getImageUrl(inspection.maskImageUrl) : undefined}
          regionsData={inspection.regionsData}
          detectedAreaPct={inspection.detectedPixelPercentage}
          title={`${inspection.surfaceType} Surface Analysis (${inspection.imageWidth}×${inspection.imageHeight} px)`}
        />

        {/* 2-Column Grid: Metrics & Quality Disclosures vs Reviewer Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quantitative Findings & Technical Specs */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Quantitative Computer Vision Metrics
                </CardTitle>
                <CardDescription className="text-xs">
                  Raw pixel area and segmented region contours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <span className="text-muted-foreground block text-[11px]">Detected Area</span>
                    <span className="text-base font-bold font-mono text-cyan-500">
                      {inspection.detectedPixelPercentage.toFixed(3)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block">{inspection.detectedPixelArea.toLocaleString()} px</span>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <span className="text-muted-foreground block text-[11px]">Region Count</span>
                    <span className="text-base font-bold font-mono text-amber-500">
                      {inspection.regionCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">Contiguous clusters</span>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <span className="text-muted-foreground block text-[11px]">Processing Latency</span>
                    <span className="text-base font-bold font-mono">
                      {inspection.processingDurationMs} ms
                    </span>
                    <span className="text-[10px] text-muted-foreground block">Execution time</span>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <span className="text-muted-foreground block text-[11px]">Physical Calib</span>
                    <span className="text-base font-bold font-mono text-emerald-500">
                      {inspection.calibrationFactor ? `${inspection.calibrationFactor} mm/px` : "None"}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {inspection.estimatedPhysicalAreaMm2 ? `${inspection.estimatedPhysicalAreaMm2} mm²` : "Pixel metric"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/60">
                  <div className="flex justify-between">
                    <span>Inference Pipeline:</span>
                    <span className="font-semibold text-foreground">{inspection.detectionMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engine Version:</span>
                    <span className="font-mono text-foreground">{inspection.modelVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Original Resolution:</span>
                    <span className="font-mono text-foreground">{inspection.imageWidth} × {inspection.imageHeight} px</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality & Limitations Disclosures */}
            {inspection.warnings.length > 0 && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" /> Image Capture & Quality Disclosures
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  {inspection.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500">•</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Field Notes */}
            <Card className="border-border/80 shadow-xs text-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground">
                  Inspector Field Remarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {inspection.notes || "No field remarks entered during capture."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Engineering Assessment & Review Workflow */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Engineering Review & Sign-Off
                </CardTitle>
                <CardDescription className="text-xs">
                  Formal sign-off by a qualified civil or structural engineer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveReview} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Review Status</label>
                    <Select value={reviewStatus} onValueChange={setReviewStatus}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="verified_record">Verified Safe Baseline Record</SelectItem>
                        <SelectItem value="requires_qualified_review">Flag: Requires Structural Core Testing</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Engineer Assessment Remarks</label>
                    <Textarea
                      rows={4}
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="Enter formal civil engineering assessment (e.g. non-structural plaster shrinkage crack; monitor on 90-day cadence)..."
                      className="text-xs leading-relaxed"
                    />
                  </div>

                  {saveSuccess && (
                    <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" /> Assessment recorded successfully!
                    </div>
                  )}

                  <Button type="submit" size="sm" className="w-full text-xs font-semibold" disabled={isSavingReview}>
                    {isSavingReview ? "Saving Sign-Off..." : "Submit Review Assessment"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Candidate Regions List */}
            {inspection.regionsData && inspection.regionsData.length > 0 && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground">
                    Segmented Region Contours ({inspection.regionsData.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {inspection.regionsData.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-2 rounded bg-muted/30 text-[11px] font-mono hover:bg-muted/50"
                    >
                      <span className="font-semibold text-primary">Region #{reg.id}</span>
                      <span>Area: {reg.area} px</span>
                      <span>Length: ~{reg.approxLengthPx} px</span>
                      <span className="text-muted-foreground">BBox: [{reg.bbox.join(", ")}]</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
