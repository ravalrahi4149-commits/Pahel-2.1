import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Shield,
  Activity,
  Layers,
  FileCheck2,
  GitCompare,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppHeader } from "@/components/layout/AppHeader";
import { ResponsibleAIDisclaimer } from "@/components/ResponsibleAIDisclaimer";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { t } = useLanguage();
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/80 py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Next-Gen Structural Health Computer Vision</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                See Every Crack. <br />
                <span className="bg-gradient-to-r from-primary via-cyan-500 to-sky-400 bg-clip-text text-transparent">
                  Track Every Change.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t("heroSubtitle")}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button size="lg" className="h-12 px-6 gap-2 text-sm font-semibold shadow-md" asChild>
                  <Link to="/inspections/new">
                    {t("startInspectionCta")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold" asChild>
                  <Link to="/dashboard">
                    {t("overview")}
                  </Link>
                </Button>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Sub-Pixel Contour Tracing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Exact Mathematical Deltas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>ReportLab PDF Certified</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Before/After Detection Hero Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-border/80 bg-card p-2.5 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Interactive Surface Scan Preview</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/40 text-cyan-500">
                    Curtain Slider: {sliderPos}%
                  </Badge>
                </div>

                {/* Split comparison container */}
                <div
                  className="relative h-72 sm:h-80 w-full overflow-hidden rounded-xl bg-slate-900 mt-2 select-none cursor-ew-resize"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                    setSliderPos(Math.round(pos));
                  }}
                  onTouchMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const touch = e.touches[0];
                    if (touch) {
                      const pos = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
                      setSliderPos(Math.round(pos));
                    }
                  }}
                >
                  {/* Base Original Surface (Right Side) */}
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <div className="w-full h-full bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center text-slate-300 p-6 text-center">
                      <Building2 className="h-10 w-10 text-slate-500 mb-2" />
                      <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Original Wall Surface</span>
                      <span className="text-[11px] text-slate-500 mt-1">Raw high-res photograph</span>
                    </div>
                  </div>

                  {/* Annotated Detection Overlay (Clipped to left of slider) */}
                  <div
                    className="absolute inset-0 bg-slate-950 overflow-hidden"
                    style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative">
                      {/* Simulated crack vector overlay */}
                      <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 400 300">
                        <path
                          d="M 120 40 L 140 90 L 135 140 L 170 190 L 165 240 L 195 280"
                          stroke="#06B6D4"
                          strokeWidth="3.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 140 90 L 175 115 L 205 130"
                          stroke="#06B6D4"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <rect x="110" y="35" width="95" height="250" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                        <text x="115" y="30" fill="#F59E0B" fontSize="10" fontFamily="monospace">Region 1 [1.42% area]</text>
                      </svg>
                      <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 z-10">AI Segmented Overlay</span>
                      <span className="text-[11px] text-cyan-300/80 mt-1 z-10">Contour + Fissure BBox</span>
                    </div>
                  </div>

                  {/* Draggable Divider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)]"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-slate-950 font-bold shadow-lg text-[10px]">
                      ↔
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-center text-muted-foreground mt-2">
                  Drag slider horizontally to reveal computer vision fissure segmentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Engineering Workflow */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("workflowTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A structured workflow connecting field photography with verifiable longitudinal engineering data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <Card className="relative overflow-hidden border-border/80 hover:border-primary/50 transition-all shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">{t("step1Title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              {t("step1Desc")}
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="relative overflow-hidden border-border/80 hover:border-primary/50 transition-all shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 mb-2">
                <Layers className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">{t("step2Title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              {t("step2Desc")}
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="relative overflow-hidden border-border/80 hover:border-primary/50 transition-all shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">{t("step3Title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              {t("step3Desc")}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-16 bg-muted/20 border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-2">Platform Capabilities</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rigorous Engineering Infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
              <div className="h-8 w-8 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                CV
              </div>
              <h3 className="text-sm font-bold">Classical CV Baseline</h3>
              <p className="text-xs text-muted-foreground">
                Adaptive CLAHE, bilateral filtering, and morphological opening for robust edge extraction without GPU dependency.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
              <div className="h-8 w-8 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                ML
              </div>
              <h3 className="text-sm font-bold">PyTorch U-Net Inference</h3>
              <p className="text-xs text-muted-foreground">
                Deep semantic segmentation pipeline. Transparently falls back to CV with honest attribution when weights are unmounted.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
              <div className="h-8 w-8 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                Δ
              </div>
              <h3 className="text-sm font-bold">Longitudinal Registration</h3>
              <p className="text-xs text-muted-foreground">
                Cross-correlation alignment scores, percentage-point difference, and relative delta quantification across temporal scans.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
              <div className="h-8 w-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                PDF
              </div>
              <h3 className="text-sm font-bold">ReportLab PDF Reports</h3>
              <p className="text-xs text-muted-foreground">
                Official engineering inspection dossiers with embedded figures, measurement tables, inspector signatures, and disclaimers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Responsible AI Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 lg:p-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm mb-3">
              <AlertTriangle className="h-5 w-5" />
              <span>Responsible AI & Civil Engineering Integrity</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Observations Distinguish From Structural Diagnoses
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              CrackLife AI never claims a building is safe, predicts catastrophic collapse, or replaces certified structural engineering inspections based on a photograph. Surface image analysis quantifies visible pixel density, highlighting regions requiring qualified human investigation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="sm" variant="outline" asChild>
                <Link to="/about">Review Engineering Guidelines</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/80">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-muted-foreground mt-1">Key information about CrackLife AI methodology and capabilities</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-semibold">
              Does CrackLife AI require a GPU or internet connectivity to run?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              No. CrackLife AI features a resilient classical computer vision baseline (NumPy / PIL / OpenCV) that runs completely locally on standard CPU hardware with zero external cloud dependencies. When PyTorch model weights are installed, it automatically leverages CUDA GPU acceleration if available.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-sm font-semibold">
              How does CrackLife AI calculate physical crack width in millimeters?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Physical millimeter measurements require a known scale calibration factor (mm/pixel) entered during inspection capture or derived from a physical reference marker placed on the wall. Without calibration, measurements are honestly and accurately reported as pixel surface area.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-sm font-semibold">
              What mathematical formulas are used to quantify crack growth over time?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              We compute both: (1) Percentage-Point Difference = later detected area % − earlier detected area %; and (2) Relative Percentage Change = (Percentage-Point Difference ÷ earlier detected area %) × 100. Alignment quality is scored through normalized 2D cross-correlation before diff mapping.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-sm font-semibold">
              Is Gujarati language supported throughout the platform?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Yes. CrackLife AI features a native English and Gujarati switcher with a comprehensive centralized dictionary covering all dashboard metrics, navigation, inspection forms, and engineering disclaimers.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/40 py-10 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">CrackLife AI</span>
            <span>— Structural Surface Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/about" className="hover:text-foreground">Methodology</Link>
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link to="/reports" className="hover:text-foreground">PDF Reports</Link>
          </div>
          <p className="text-[11px]">© 2026 CrackLife AI. Engineered for civil diagnostics.</p>
        </div>
      </footer>
    </div>
  );
}
