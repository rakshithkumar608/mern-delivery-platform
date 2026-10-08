import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <ShieldAlert className="size-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        403 — Access Denied
      </h1>
      <p className="max-w-md text-sm text-muted-foreground mt-2 mb-6">
        You do not have the required role or administrative privileges to view this section.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/login" className={buttonVariants({ variant: "default" })}>
          <ArrowLeft data-icon="inline-start" className="size-4" />
          Back to Portal
        </Link>
      </div>
    </div>
  );
}
