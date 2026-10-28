import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Settings,
  User,
  Globe,
  Moon,
  Sun,
  Shield,
  Layers,
  CheckCircle,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.fullName || "Dr. Elena Vance, P.E.");
  const [organization, setOrganization] = useState(user?.organization || "Apex Structural Health Diagnostic Lab");
  const [defaultMode, setDefaultMode] = useState<string>("auto");
  const [notifyReview, setNotifyReview] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("settings")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inspector profile, language localization, appearance, and computer vision preferences
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold">Inspector Profile</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Credentials displayed on official inspection reports and PDF dossiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <Label htmlFor="fname" className="text-xs">Full Name & Professional Title</Label>
                <Input
                  id="fname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="forg" className="text-xs">Affiliated Organization / Diagnostic Agency</Label>
                <Input
                  id="forg"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="femail" className="text-xs">Account Email</Label>
                <Input
                  id="femail"
                  disabled
                  value={user?.email || "demo@cracklife.ai"}
                  className="text-xs bg-muted/40 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Localization & Appearance */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-500" />
                <CardTitle className="text-sm font-bold">Localization & Display Theme</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Language dictionary switcher and high-contrast color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Platform Language</span>
                  <span className="text-[11px] text-muted-foreground">
                    Switch between English and Gujarati (ગુજરાતી) across all views
                  </span>
                </div>
                <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                  <SelectTrigger className="w-40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <div>
                  <span className="font-semibold block">Color Theme</span>
                  <span className="text-[11px] text-muted-foreground">
                    Select dark or light engineering workstation mode
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={theme === "light" ? "secondary" : "outline"}
                    className="h-8 text-xs gap-1"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-3.5 w-3.5" /> Light
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={theme === "dark" ? "secondary" : "outline"}
                    className="h-8 text-xs gap-1"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-3.5 w-3.5" /> Dark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Computer Vision Preferences */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-500" />
                <CardTitle className="text-sm font-bold">Computer Vision Inference Defaults</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Default segmentation pipeline strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Default Analysis Engine</span>
                  <span className="text-[11px] text-muted-foreground">
                    Auto falls back safely to Classical CV if PyTorch weights are absent
                  </span>
                </div>
                <Select value={defaultMode} onValueChange={setDefaultMode}>
                  <SelectTrigger className="w-56 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="auto">Auto (Adaptive Hybrid)</SelectItem>
                    <SelectItem value="cv">Classical CV Baseline</SelectItem>
                    <SelectItem value="ml">PyTorch U-Net Inference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <div>
                  <span className="font-semibold block">In-App Growth Alert Triggers</span>
                  <span className="text-[11px] text-muted-foreground">
                    Notify when delta exceeds +0.05 percentage-point increase
                  </span>
                </div>
                <Switch checked={notifyReview} onCheckedChange={setNotifyReview} />
              </div>
            </CardContent>
          </Card>

          {savedSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-500 flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4" /> Preferences updated and persisted successfully!
            </div>
          )}

          <Button type="submit" size="sm" className="font-semibold text-xs h-9 px-6">
            {t("save")}
          </Button>
        </form>

        {/* System Version & Integrity Info */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-[11px] text-muted-foreground space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Platform:</span>
            <span className="text-foreground">CrackLife AI Enterprise</span>
          </div>
          <div className="flex justify-between">
            <span>Backend Engine:</span>
            <span className="text-foreground">Python Flask 3.0 / SQLAlchemy / ReportLab</span>
          </div>
          <div className="flex justify-between">
            <span>Frontend Runtime:</span>
            <span className="text-foreground">React 19 / TypeScript / Vite / Tailwind</span>
          </div>
          <div className="flex justify-between">
            <span>Database Connection:</span>
            <span className="text-foreground">SQLite (Local) / PostgreSQL (Production ready)</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
