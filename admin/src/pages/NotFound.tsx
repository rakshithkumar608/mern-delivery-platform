import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F8FA] dark:bg-[#1A1A2E] p-6 text-center">
      <div className="w-full max-w-md rounded-[28px] border border-[#E5E7EB] dark:border-[#2D2D4A] bg-white dark:bg-[#222240] p-8 sm:p-10 shadow-chowly-card flex flex-col items-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#00B37A] dark:bg-emerald-950/40 mb-6 shadow-xs">
          <FileQuestion className="size-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-[#00B37A] mb-3">
          Error 404
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A2E] dark:text-[#F0F0F5]">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-2 mb-8 leading-relaxed">
          The requested administrative module, order route, or settings view does not exist.
        </p>

        <Link
          to="/admin/dashboard"
          className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#00B37A] hover:bg-[#00875A] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
