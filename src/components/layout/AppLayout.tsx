import React, { useState } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { ResponsibleAIDisclaimer } from "../ResponsibleAIDisclaimer";

export const AppLayout: React.FC<{ children: React.ReactNode; showDisclaimer?: boolean }> = ({
  children,
  showDisclaimer = true,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <AppHeader onMenuToggle={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}

          {showDisclaimer && (
            <div className="pt-6 border-t border-border/60">
              <ResponsibleAIDisclaimer />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
