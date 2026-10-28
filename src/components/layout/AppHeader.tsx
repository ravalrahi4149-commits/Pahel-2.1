import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Moon,
  Sun,
  Globe,
  LogOut,
  User,
  Settings,
  Shield,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-context";

export const AppHeader: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const routerState = useRouterState();

  const getPageTitle = (pathname: string) => {
    if (pathname.includes("/dashboard")) return t("dashboard");
    if (pathname.includes("/buildings")) return t("buildings");
    if (pathname.includes("/inspections/new")) return t("newInspection");
    if (pathname.includes("/inspections")) return t("inspectionHistory");
    if (pathname.includes("/compare")) return t("compareInspections");
    if (pathname.includes("/monitoring")) return t("growthMonitoring");
    if (pathname.includes("/reports")) return t("reports");
    if (pathname.includes("/settings")) return t("settings");
    if (pathname.includes("/about")) return t("helpAbout");
    return t("overview");
  };

  const currentTitle = getPageTitle(routerState.location.pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={onMenuToggle}
          >
            <Activity className="h-5 w-5 text-primary" />
          </Button>
        )}

        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline-block font-extrabold bg-gradient-to-r from-primary via-cyan-500 to-sky-400 bg-clip-text text-transparent">
              {t("brandName")}
            </span>
          </Link>
          <span className="hidden md:inline-block text-muted-foreground/40">|</span>
          <span className="hidden md:inline-block text-sm font-medium text-muted-foreground">
            {currentTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 px-2 gap-1.5 text-xs font-medium">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{language === "en" ? "English" : "ગુજરાતી"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem onClick={() => setLanguage("en")} className="gap-2">
              <span className={language === "en" ? "font-bold text-primary" : ""}>English</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("gu")} className="gap-2">
              <span className={language === "gu" ? "font-bold text-primary" : ""}>ગુજરાતી (Gujarati)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        {isAuthenticated && <NotificationCenter />}

        {/* User Account Menu */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "PE"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 text-xs">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold leading-none">{user?.fullName || "Inspector"}</p>
                  <p className="text-[11px] leading-none text-muted-foreground truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground w-fit">
                    {user?.role || "Inspector"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-3.5 w-3.5" />
                  <span>{t("settings")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/about" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-3.5 w-3.5" />
                  <span>{t("helpAbout")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive gap-2 cursor-pointer">
                <LogOut className="h-3.5 w-3.5" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">{t("login")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">{t("register")}</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
