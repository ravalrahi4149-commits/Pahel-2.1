import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  Camera,
  Layers,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  FileImage,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/layout/AppLayout";
import { api, Building } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/inspections/new")({
  component: NewInspectionPage,
});

function NewInspectionPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [surfaceType, setSurfaceType] = useState<string>("Wall");
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [calibrationScale, setCalibrationScale] = useState<string>("");
  const [preferredMode, setPreferredMode] = useState<string>("auto");

  // File & Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const res = await api.getBuildings();
        setBuildings(res.buildings || []);
        if (res.buildings?.length > 0) {
          setSelectedBuildingId(String(res.buildings[0].id));
        }
      } catch (err) {
        console.warn("Could not load buildings", err);
      }
    };
    loadBuildings();
  }, []);

  const handleFileSelect = (file: File) => {
    setError(null);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > 32 * 1024 * 1024) {
      setError("File exceeds maximum allowable size (32MB).");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select or capture a surface photograph.");
      return;
    }
    if (!selectedBuildingId) {
      setError("Please select a building asset.");
      return;
    }
    if (!location.trim()) {
      setError("Please specify the surface location (e.g. 'East Wall, Column 4 Joint').");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(15);
    setProcessingStatus("Uploading surface image...");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("buildingId", selectedBuildingId);
      formData.append("surfaceType", surfaceType);
      formData.append("location", location);
      formData.append("notes", notes);
      formData.append("preferredMode", preferredMode);
      if (calibrationScale) {
        formData.append("calibrationFactor", calibrationScale);
      }

      // Simulate step progression for UX clarity
      setTimeout(() => {
        setProgress(45);
        setProcessingStatus("Executing computer vision adaptive filtering & contour extraction...");
      }, 400);

      setTimeout(() => {
        setProgress(75);
        setProcessingStatus("Generating crack highlight overlays and candidate bounding boxes...");
      }, 900);

      const res = await api.uploadAndAnalyzeInspection(formData);

      setProgress(100);
      setProcessingStatus("Analysis complete. Redirecting...");

      setTimeout(() => {
        navigate({
          to: "/inspections/$id",
          params: { id: String(res.inspection.id) },
        });
      }, 600);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || "Failed to process inspection. Please retry.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("newInspection")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload surface photographs for computer vision fissure segmentation, measurement, and change tracking
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Image Upload & Preview Card */}
            <div className="md:col-span-6 space-y-4">
              <Card className="border-border/80 shadow-xs overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">1. Surface Photograph</CardTitle>
                  <CardDescription className="text-xs">
                    JPEG, PNG, or WebP (up to 32MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-border bg-slate-900 max-h-72 flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Upload Preview"
                          className="max-h-72 w-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-destructive"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          Remove Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/30"
                    >
                      <UploadCloud className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                      <p className="text-xs font-semibold text-foreground">
                        Drag and drop photograph here, or click to browse
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Ensure perpendicular camera alignment for highest metric accuracy
                      </p>

                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="text-xs h-8 gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <FileImage className="h-3.5 w-3.5" /> File Picker
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            cameraInputRef.current?.click();
                          }}
                        >
                          <Camera className="h-3.5 w-3.5" /> Mobile Camera
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Hidden inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />
                </CardContent>
              </Card>

              {/* Calibration Guide Callout */}
              <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
                <span className="font-semibold text-foreground block">Calibration & Lighting Tips:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Position camera parallel to wall surface to avoid perspective skew.</li>
                  <li>Avoid harsh direct flash that produces reflective hot spots.</li>
                  <li>Place a physical millimeter ruler or coin near crack for mm calibration.</li>
                </ul>
              </div>
            </div>

            {/* Right: Structural Inspection Details */}
            <div className="md:col-span-6 space-y-4">
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">2. Inspection Metadata</CardTitle>
                  <CardDescription className="text-xs">
                    Associate surface scan with monitored asset
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="bldSelect" className="text-xs font-semibold">
                      Target Building Asset *
                    </Label>
                    <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select target facility" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        {buildings.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.name} ({b.identifier})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="surfType" className="text-xs font-semibold">
                        {t("surfaceType")} *
                      </Label>
                      <Select value={surfaceType} onValueChange={setSurfaceType}>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="Wall">Wall Surface</SelectItem>
                          <SelectItem value="Beam Surface">Beam Surface</SelectItem>
                          <SelectItem value="Column Surface">Column Surface</SelectItem>
                          <SelectItem value="Ceiling">Ceiling Surface</SelectItem>
                          <SelectItem value="Slab Surface">Slab Surface</SelectItem>
                          <SelectItem value="Foundation Pier">Foundation Pier</SelectItem>
                          <SelectItem value="Other">Other Masonry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="locInput" className="text-xs font-semibold">
                        {t("location")} *
                      </Label>
                      <Input
                        id="locInput"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Column B4 Joint, L2"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="calib" className="text-xs font-semibold">
                        {t("calibrationScale")}
                      </Label>
                      <Input
                        id="calib"
                        type="number"
                        step="0.01"
                        value={calibrationScale}
                        onChange={(e) => setCalibrationScale(e.target.value)}
                        placeholder="e.g. 0.25 (optional)"
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="modeSelect" className="text-xs font-semibold">
                        Pipeline Mode
                      </Label>
                      <Select value={preferredMode} onValueChange={setPreferredMode}>
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="auto">Auto (ML with CV fallback)</SelectItem>
                          <SelectItem value="cv">Classical CV Baseline</SelectItem>
                          <SelectItem value="ml">PyTorch U-Net Inference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notesInput" className="text-xs font-semibold">
                      {t("inspectorNotes")}
                    </Label>
                    <Textarea
                      id="notesInput"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Field observations, ambient conditions, diurnal temperature range..."
                      className="text-xs"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Progress & Submit */}
              {isProcessing && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{processingStatus}</span>
                    <span className="font-mono text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full text-xs font-bold h-11 gap-2 shadow-md"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Analyzing Surface..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Run Crack Detection & Log Inspection
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
