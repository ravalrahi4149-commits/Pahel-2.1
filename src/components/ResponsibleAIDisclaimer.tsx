import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const ResponsibleAIDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <span className="font-semibold">{t("disclaimerTitle")}: </span>
          {t("disclaimerText")}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs leading-relaxed text-muted-foreground">
      <div className="flex items-center gap-2 mb-1.5 font-semibold text-amber-700 dark:text-amber-400">
        <ShieldCheck className="h-4 w-4" />
        <span>{t("disclaimerTitle")}</span>
      </div>
      <p>{t("disclaimerText")}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/80 font-mono">
        <span>• Classical CV / Neural Segmentation</span>
        <span>• Calibration scale requires manual confirmation</span>
        <span>• Does not replace on-site physical engineering core testing</span>
      </div>
    </div>
  );
};
