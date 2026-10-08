import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 mb-5 ring-1 ring-red-500/20 shadow-sm">
          <ShieldAlert className="size-8" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          403 — Access Denied
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-7 leading-relaxed">
          Your account does not possess the required platform role permissions to access this administrative zone.
        </p>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to Portal Login
        </Link>
      </div>
    </div>
  );
}
