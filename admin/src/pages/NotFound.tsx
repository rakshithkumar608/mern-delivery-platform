import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-6 text-center text-[#111827]">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-xs flex flex-col items-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 mb-4">
          <FileQuestion className="size-6" />
        </div>

        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          404 Not Found
        </span>

        <h1 className="text-lg font-semibold text-gray-900">
          Page Not Found
        </h1>
        <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
          The requested administrative module or page does not exist.
        </p>

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-medium transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return to Overview</span>
        </Link>
      </div>
    </div>
  );
}
