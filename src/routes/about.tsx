import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import {
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  Scale,
  Cpu,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { ResponsibleAIDisclaimer } from "@/components/ResponsibleAIDisclaimer";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: HelpAboutPage,
});

function HelpAboutPage() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Methodology & Architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            CrackLife AI Engineering Handbook
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Technical principles, detection modes, measurement formulas, and responsible AI guardrails
          </p>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <ResponsibleAIDisclaimer />

        {/* 1. Vision & Civil Diagnostics Core */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. Core Diagnostic Purpose</h2>
          <Card className="border-border/80 p-5 text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              CrackLife AI is an artificial intelligence-assisted building crack detection, surface documentation, and longitudinal monitoring platform. Its primary purpose is to help civil engineers, asset inspectors, and building managers:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Record repeatable, high-resolution photographs of reinforced concrete, masonry, and plaster surfaces.</li>
              <li>Detect and segment visible crack fissures using computer vision techniques.</li>
              <li>Register recurring scans over time to quantify visible fissure elongation or stabilization.</li>
              <li>Generate compliance-ready PDF engineering dossiers for professional review.</li>
            </ul>
            <p className="text-amber-600 dark:text-amber-400 font-semibold pt-1">
              Crucial Principle: Image segmentation measures surface pixel reflections. It does NOT evaluate internal rebar condition, concrete compressive strength, load-bearing redistribution, or seismic risk.
            </p>
          </Card>
        </section>

        {/* 2. Detection Modes: A, B, and C */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold">2. Detection Modes & Pipeline Architecture</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode A */}
            <Card className="border-border/80 p-4 space-y-2 text-xs">
              <Badge variant="outline" className="text-blue-500 border-blue-500/30 font-bold">
                Mode A: Classical CV
              </Badge>
              <h3 className="font-bold text-foreground">OpenCV / NumPy Baseline</h3>
              <p className="text-muted-foreground leading-relaxed">
                Applies Bilateral filtering for noise smoothing, CLAHE for localized illumination equalization, adaptive Gaussian thresholding, and morphological opening/closing to isolate elongated contiguous dark troughs.
              </p>
              <span className="text-[10px] text-muted-foreground font-mono block">Zero GPU requirement.</span>
            </Card>

            {/* Mode B */}
            <Card className="border-border/80 p-4 space-y-2 text-xs">
              <Badge variant="outline" className="text-purple-500 border-purple-500/30 font-bold">
                Mode B: Learned Model
              </Badge>
              <h3 className="font-bold text-foreground">PyTorch U-Net Inference</h3>
              <p className="text-muted-foreground leading-relaxed">
                A 4-tier symmetric encoder-decoder convolutional network with skip connections for high-resolution semantic segmentation. If model weights are unmounted, it falls back to Mode A with zero fabricated accuracy claims.
              </p>
              <span className="text-[10px] text-muted-foreground font-mono block">Transparent fallback.</span>
            </Card>

            {/* Mode C */}
            <Card className="border-border/80 p-4 space-y-2 text-xs">
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-bold">
                Mode C: Training Ready
              </Badge>
              <h3 className="font-bold text-foreground">Training & Evaluation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Includes <code className="text-primary font-mono">train_segmentation.py</code> with Dice + BCE composite loss for class imbalance, flip augmentations, and evaluation metrics: Precision, Recall, IoU (Jaccard), and Dice (F1).
              </p>
              <span className="text-[10px] text-muted-foreground font-mono block">Fully reproducible.</span>
            </Card>
          </div>
        </section>

        {/* 3. Mathematical Formulas */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. Exact Mathematical Formulas</h2>
          <Card className="border-border/80 p-5 text-xs space-y-3">
            <div>
              <span className="font-semibold text-foreground block">Surface Pixel Density Percentage:</span>
              <code className="text-primary font-mono text-[11px] block mt-1 bg-muted p-2 rounded">
                Detected Area % = (Detected Crack Pixels ÷ Total Image Pixels) × 100
              </code>
            </div>

            <div className="border-t border-border/60 pt-3">
              <span className="font-semibold text-foreground block">Longitudinal Percentage-Point Difference:</span>
              <code className="text-primary font-mono text-[11px] block mt-1 bg-muted p-2 rounded">
                Percentage-Point Difference = Later Detected Area % − Earlier Detected Area %
              </code>
            </div>

            <div className="border-t border-border/60 pt-3">
              <span className="font-semibold text-foreground block">Relative Percentage Change:</span>
              <code className="text-primary font-mono text-[11px] block mt-1 bg-muted p-2 rounded">
                Relative % Change = (Percentage-Point Difference ÷ Earlier Detected Area %) × 100
              </code>
              <p className="text-[11px] text-muted-foreground mt-1">
                Computed only when the earlier baseline area is non-zero.
              </p>
            </div>

            <div className="border-t border-border/60 pt-3">
              <span className="font-semibold text-foreground block">Image Registration Alignment Score:</span>
              <code className="text-primary font-mono text-[11px] block mt-1 bg-muted p-2 rounded">
                Alignment Score = ((Normalized 2D Cross-Correlation + 1.0) ÷ 2.0) × 100%
              </code>
            </div>
          </Card>
        </section>

        {/* 4. Physical Scale Calibration */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. Physical Scale Calibration & Limitations</h2>
          <Card className="border-border/80 p-5 text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              Cameras capture 2D angular projections of 3D physical surfaces. Because distance and lens focal length vary, a pixel does not inherently correspond to a fixed millimeter dimension.
            </p>
            <p>
              When a physical reference marker (e.g. 50mm calibration card or known coin) is included in the frame, an inspector enters the <strong className="text-foreground">Calibration Factor (mm/pixel)</strong>.
            </p>
            <p className="font-semibold text-foreground">
              Estimated Physical Area (mm²) = Detected Pixel Area × (Calibration Factor)²
            </p>
            <p>
              If uncalibrated, CrackLife AI strictly reports measurements in pixel area and alerts the inspector accordingly.
            </p>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
