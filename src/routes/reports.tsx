import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Building2,
  Layers,
  FileCheck2,
  ExternalLink,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { api, Inspection, Building } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/reports")({
  component: ReportsHubPage,
});

function ReportsHubPage() {
  const { t } = useLanguage();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inspRes, bldRes] = await Promise.all([
          api.getInspections(),
          api.getBuildings(),
        ]);
        setInspections(inspRes.inspections || []);
        setBuildings(bldRes.buildings || []);
      } catch (err) {}
      finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("reports")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Export certified ReportLab PDF inspection dossiers and tabular measurement CSV archives
          </p>
        </div>

        {/* Global Export Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-sm font-bold">CSV Measurement Archive</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Raw tabulated records including pixel area, fissure counts, review statuses, and dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild className="gap-2 text-xs font-semibold">
                <a href={api.getInspectionsCsvUrl()} download="CrackLife_Inspections.csv">
                  <Download className="h-3.5 w-3.5" /> Download Full CSV Export
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-bold">ReportLab PDF Engine</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Server-side generated PDF dossiers containing high-contrast overlays, tables, and disclaimers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Download individual inspection PDFs below for immediate regulatory filing or archival storage.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Individual Inspection PDF Table */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Available PDF Inspection Dossiers</CardTitle>
            <CardDescription className="text-xs">
              Click any report to download the official PDF generated with embedded inspection figures
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading dossiers...</div>
            ) : inspections.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No inspection reports generated yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/70 text-muted-foreground font-medium">
                    <tr>
                      <th className="pb-2.5 font-semibold">Report ID</th>
                      <th className="pb-2.5 font-semibold">Asset Name</th>
                      <th className="pb-2.5 font-semibold">Surface & Location</th>
                      <th className="pb-2.5 font-semibold">Inspection Date</th>
                      <th className="pb-2.5 font-semibold">Detected Density</th>
                      <th className="pb-2.5 font-semibold">Review Status</th>
                      <th className="pb-2.5 font-semibold text-right">PDF Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {inspections.map((insp) => (
                      <tr key={insp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-mono font-medium text-primary">
                          CL-INS-{insp.id.toString().padStart(5, "0")}
                        </td>
                        <td className="py-2.5 font-medium">{insp.buildingName || "Asset"}</td>
                        <td className="py-2.5 text-muted-foreground">
                          {insp.surfaceType} • {insp.location}
                        </td>
                        <td className="py-2.5 text-muted-foreground font-mono">
                          {new Date(insp.inspectionDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 font-mono">
                          {insp.detectedPixelPercentage.toFixed(2)}%
                        </td>
                        <td className="py-2.5">
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
                        </td>
                        <td className="py-2.5 text-right">
                          <Button size="sm" variant="outline" asChild className="h-7 text-xs px-2.5 gap-1.5 text-primary">
                            <a
                              href={api.getInspectionPdfUrl(insp.id)}
                              download={`CrackLife_Report_${insp.id}.pdf`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="h-3 w-3" /> Download PDF
                            </a>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
