import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  History,
  GitCompare,
  TrendingUp,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { t } = useLanguage();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const navItems = [
    { title: t("overview"), to: "/dashboard", icon: LayoutDashboard },
    { title: t("buildings"), to: "/buildings", icon: Building2 },
    { title: t("newInspection"), to: "/inspections/new", icon: PlusCircle, highlight: true },
    { title: t("inspectionHistory"), to: "/inspections", icon: History },
    { title: t("compareInspections"), to: "/compare", icon: GitCompare },
    { title: t("growthMonitoring"), to: "/monitoring", icon: TrendingUp },
    { title: t("reports"), to: "/reports", icon: FileText },
    { title: t("settings"), to: "/settings", icon: Settings },
    { title: t("helpAbout"), to: "/about", icon: HelpCircle },
  ];

  const sidebarContent = (
    <aside
      className={`flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2.5 px-2 font-bold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold leading-tight tracking-tight text-sidebar-foreground">
                CrackLife AI
              </span>
              <span className="text-[10px] text-muted-foreground font-mono leading-none">
                Civil Vision Lab
              </span>
            </div>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.to === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.to);

          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to as any}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : item.highlight
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? item.title : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${item.highlight && !isActive ? "text-primary" : ""}`} />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/20">
          <div className="rounded-lg bg-card/10 p-2.5 text-[11px] text-muted-foreground">
            <span className="font-semibold block text-sidebar-foreground">CrackLife AI Platform</span>
            <span className="block mt-0.5 text-[10px]">v2.4 Production Engine</span>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex w-72 max-w-[85vw] flex-col bg-background">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
