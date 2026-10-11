import { Download } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  onExportReport?: () => void;
  isExporting?: boolean;
}

export function DashboardHeader({
  userName = "Amaka",
  onExportReport,
  isExporting = false,
}: DashboardHeaderProps) {
  // Compute greeting based on time of day
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = userName.split(" ")[0] || "Amaka";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is what is happening across Chowly today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onExportReport}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00875A] hover:bg-[#00704A] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
        >
          <Download className="size-4" />
          <span>{isExporting ? "Exporting..." : "Export report"}</span>
        </button>
      </div>
    </div>
  );
}
