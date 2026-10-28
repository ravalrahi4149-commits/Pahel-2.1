import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sliders,
  Columns,
  Eye,
  Layers,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface ImageComparisonViewerProps {
  originalUrl: string;
  overlayUrl?: string;
  maskUrl?: string;
  regionsData?: Array<{ id: number; bbox: [number, number, number, number]; area: number; approxLengthPx: number }>;
  detectedAreaPct?: number;
  title?: string;
}

export const ImageComparisonViewer: React.FC<ImageComparisonViewerProps> = ({
  originalUrl,
  overlayUrl,
  maskUrl,
  regionsData = [],
  detectedAreaPct,
  title = "Crack Analysis Surface Inspection",
}) => {
  const [viewMode, setViewMode] = useState<"blend" | "side-by-side" | "split" | "mask">("blend");
  const [blendOpacity, setBlendOpacity] = useState<number>(0.85);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage for curtain slider
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all ${
        isFullscreen ? "p-4 bg-slate-950 text-slate-100" : ""
      }`}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-3 bg-muted/40">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">{title}</span>
          {detectedAreaPct !== undefined && (
            <Badge variant="outline" className="text-xs font-mono font-medium border-primary/40 bg-primary/10 text-primary">
              {detectedAreaPct.toFixed(2)}% crack density
            </Badge>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-background/80 rounded-lg p-1 border border-border/70 text-xs">
          <Button
            size="sm"
            variant={viewMode === "blend" ? "secondary" : "ghost"}
            className="h-7 px-2.5 text-xs gap-1.5"
            onClick={() => setViewMode("blend")}
          >
            <Sliders className="h-3.5 w-3.5" /> Blend
          </Button>
          <Button
            size="sm"
            variant={viewMode === "split" ? "secondary" : "ghost"}
            className="h-7 px-2.5 text-xs gap-1.5"
            onClick={() => setViewMode("split")}
          >
            <Columns className="h-3.5 w-3.5" /> Curtain
          </Button>
          <Button
            size="sm"
            variant={viewMode === "side-by-side" ? "secondary" : "ghost"}
            className="h-7 px-2.5 text-xs gap-1.5"
            onClick={() => setViewMode("side-by-side")}
          >
            <Eye className="h-3.5 w-3.5" /> Side-by-Side
          </Button>
          {maskUrl && (
            <Button
              size="sm"
              variant={viewMode === "mask" ? "secondary" : "ghost"}
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setViewMode("mask")}
            >
              Mask
            </Button>
          )}
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleResetZoom} title="Reset View">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Opacity Slider Bar (Visible when in Blend or Curtain mode) */}
      {viewMode === "blend" && overlayUrl && (
        <div className="flex items-center gap-4 px-6 py-2 bg-muted/20 border-b border-border/60 text-xs">
          <span className="font-medium text-muted-foreground whitespace-nowrap">Overlay Blend:</span>
          <Slider
            value={[blendOpacity * 100]}
            min={0}
            max={100}
            step={1}
            className="w-48"
            onValueChange={([val]) => setBlendOpacity(val / 100)}
          />
          <span className="font-mono text-muted-foreground">{Math.round(blendOpacity * 100)}%</span>
        </div>
      )}

      {viewMode === "split" && (
        <div className="flex items-center gap-4 px-6 py-2 bg-muted/20 border-b border-border/60 text-xs">
          <span className="font-medium text-muted-foreground whitespace-nowrap">Split Position:</span>
          <Slider
            value={[splitPos]}
            min={5}
            max={95}
            step={1}
            className="w-48"
            onValueChange={([val]) => setSplitPos(val)}
          />
          <span className="font-mono text-muted-foreground">{splitPos}%</span>
        </div>
      )}

      {/* Main Canvas / Image Area */}
      <div className="relative min-h-[380px] max-h-[640px] w-full overflow-hidden bg-slate-900/95 flex items-center justify-center p-2 select-none">
        {/* MODE: BLEND */}
        {viewMode === "blend" && (
          <div
            className="relative transition-transform duration-100 ease-out flex items-center justify-center max-w-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Base original image */}
            <img
              src={originalUrl}
              alt="Original wall"
              className="max-h-[560px] max-w-full rounded object-contain shadow-lg"
            />
            {/* Overlay layer on top */}
            {overlayUrl && (
              <img
                src={overlayUrl}
                alt="Crack overlay"
                className="absolute inset-0 max-h-[560px] max-w-full h-full w-full object-contain pointer-events-none rounded transition-opacity duration-75"
                style={{ opacity: blendOpacity }}
              />
            )}
          </div>
        )}

        {/* MODE: CURTAIN SPLIT */}
        {viewMode === "split" && overlayUrl && (
          <div
            className="relative transition-transform duration-100 ease-out flex items-center justify-center max-w-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Base original photo */}
            <img
              src={originalUrl}
              alt="Original surface"
              className="max-h-[560px] max-w-full rounded object-contain shadow-lg"
            />
            {/* Clipped overlay layer */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` }}
            >
              <img
                src={overlayUrl}
                alt="Overlay"
                className="max-h-[560px] max-w-full h-full w-full object-contain rounded"
              />
            </div>
            {/* Divider line indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] pointer-events-none"
              style={{ left: `${splitPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 text-[10px] font-bold px-1 py-0.5 rounded shadow">
                ◀▶
              </div>
            </div>
          </div>
        )}

        {/* MODE: SIDE BY SIDE */}
        {viewMode === "side-by-side" && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-full p-2 transition-transform duration-100"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 mb-1">
                ORIGINAL INSPECTION PHOTOGRAPH
              </span>
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-[480px] w-auto rounded object-contain border border-slate-700 shadow"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-semibold tracking-wider text-cyan-400 mb-1">
                CRACKLIFE AI ANNOTATED OVERLAY
              </span>
              <img
                src={overlayUrl || originalUrl}
                alt="Annotated"
                className="max-h-[480px] w-auto rounded object-contain border border-cyan-800 shadow"
              />
            </div>
          </div>
        )}

        {/* MODE: BINARY MASK */}
        {viewMode === "mask" && maskUrl && (
          <div
            className="relative transition-transform duration-100 ease-out flex items-center justify-center max-w-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={maskUrl}
              alt="Binary crack mask"
              className="max-h-[560px] max-w-full rounded object-contain bg-black border border-slate-700 shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Bottom Information / Region Badge List */}
      {regionsData.length > 0 && (
        <div className="border-t border-border/80 px-4 py-2.5 bg-muted/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="font-semibold text-muted-foreground whitespace-nowrap">Candidate Fissures:</span>
            {regionsData.slice(0, 8).map((reg) => (
              <Badge key={reg.id} variant="secondary" className="text-[11px] font-mono px-2 py-0.5">
                R{reg.id}: {reg.area} px ({reg.approxLengthPx} px len)
              </Badge>
            ))}
            {regionsData.length > 8 && (
              <span className="text-muted-foreground text-[11px]">+{regionsData.length - 8} more</span>
            )}
          </div>
          {overlayUrl && (
            <a
              href={overlayUrl}
              download="cracklife_analysis_overlay.png"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <Download className="h-3.5 w-3.5" /> Download Overlay Image
            </a>
          )}
        </div>
      )}
    </div>
  );
};
