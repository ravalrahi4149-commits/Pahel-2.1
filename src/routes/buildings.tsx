import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Trash2,
  Edit2,
  Activity,
  Layers,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { api, Building } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/buildings")({
  component: BuildingsPage,
});

function BuildingsPage() {
  const { t } = useLanguage();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [address, setAddress] = useState("");
  const [buildingType, setBuildingType] = useState("Commercial");
  const [floors, setFloors] = useState("4");
  const [yearBuilt, setYearBuilt] = useState("2015");
  const [description, setDescription] = useState("");

  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBuildings({
        search: search || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      });
      setBuildings(res.buildings || []);
    } catch (err) {
      console.warn("Could not load buildings from API", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBuildings();
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBuilding({
        name,
        identifier: identifier || undefined,
        address,
        buildingType,
        floors: Number(floors) || 1,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
        description,
      });
      setIsCreateOpen(false);
      setName("");
      setIdentifier("");
      setAddress("");
      setDescription("");
      fetchBuildings();
    } catch (err) {
      alert("Error creating building. Please try again.");
    }
  };

  const handleDeleteBuilding = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this building asset and all its inspection records?")) {
      return;
    }
    try {
      await api.deleteBuilding(id);
      fetchBuildings();
    } catch (err) {
      alert("Failed to delete building.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("buildings")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Portfolio of structural assets, infrastructure piers, and monitored facilities
            </p>
          </div>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 text-xs font-semibold">
            <Plus className="h-4 w-4" /> {t("addBuilding")}
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9 text-xs h-9"
            />
          </form>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44 text-xs h-9">
              <SelectValue placeholder="All Asset Types" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Asset Types</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              <SelectItem value="Heritage">Heritage</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buildings Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading building records...</div>
        ) : buildings.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Building2 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-semibold">{t("emptyState")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Register a structural asset or adjust your search filters.
            </p>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="mt-4 text-xs">
              Register First Asset
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {buildings.map((b) => (
              <Card
                key={b.id}
                className="hover:border-primary/50 transition-all flex flex-col justify-between shadow-xs"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                      {b.identifier}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        b.monitoringStatus === "review_needed"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {b.monitoringStatus === "review_needed" ? "Review Needed" : "Active"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold mt-2 truncate">{b.name}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1 line-clamp-1 mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{b.address}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-4 text-xs">
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Structure:</span>
                      <span className="font-semibold">{b.buildingType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Floors:</span>
                      <span className="font-semibold">{b.floors} stories</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Total Scans:</span>
                      <span className="font-semibold">{b.inspectionCount} inspections</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Last Density:</span>
                      <span className="font-semibold font-mono">
                        {b.latestDetectedAreaPct ? `${b.latestDetectedAreaPct.toFixed(2)}%` : "N/A"}
                      </span>
                    </div>
                  </div>

                  {b.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {b.description}
                    </p>
                  )}
                </CardContent>

                <div className="border-t border-border/80 px-4 py-2.5 bg-muted/20 flex items-center justify-between">
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold gap-1 text-primary">
                    <Link to="/buildings/$id" params={{ id: String(b.id) }}>
                      {t("viewDetails")} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDeleteBuilding(b.id, e)}
                    title="Delete Building"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Building Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{t("addBuilding")}</DialogTitle>
              <DialogDescription className="text-xs">
                Register a new structural asset for computer vision crack detection and history tracking.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateBuilding} className="space-y-3.5 py-2">
              <div className="space-y-1">
                <Label htmlFor="bname" className="text-xs">{t("buildingName")} *</Label>
                <Input
                  id="bname"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Central Commercial Tower"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="bident" className="text-xs">{t("buildingId")}</Label>
                  <Input
                    id="bident"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Auto-generated if blank"
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="btype" className="text-xs">{t("buildingType")}</Label>
                  <Select value={buildingType} onValueChange={setBuildingType}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Heritage">Heritage</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="baddr" className="text-xs">{t("address")} *</Label>
                <Input
                  id="baddr"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 104 Sector 4, Financial District"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="bfloors" className="text-xs">{t("floors")}</Label>
                  <Input
                    id="bfloors"
                    type="number"
                    min="1"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="byear" className="text-xs">{t("yearBuilt")}</Label>
                  <Input
                    id="byear"
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    placeholder="e.g. 2012"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="bdesc" className="text-xs">Notes / Description</Label>
                <Textarea
                  id="bdesc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Structural framing details, load history..."
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" size="sm">
                  Register Asset
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
