import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-slate-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 mb-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
          <FileQuestion className="size-8" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          404 — Page Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-7 leading-relaxed">
          The requested operations module or route does not exist or has been relocated.
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
