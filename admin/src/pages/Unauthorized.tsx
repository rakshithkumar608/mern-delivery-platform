import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-6 text-center text-[#111827]">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-xs flex flex-col items-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
          <ShieldAlert className="size-6" />
        </div>

        <span className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
          403 Access Denied
        </span>

        <h1 className="text-lg font-semibold text-gray-900">
          Unauthorized
        </h1>
        <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
          Your account role does not have permission to view this section.
        </p>

        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-medium transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
