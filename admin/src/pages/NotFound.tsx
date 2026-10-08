import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
        <FileQuestion className="size-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        404 — Page Not Found
      </h1>
      <p className="max-w-md text-sm text-muted-foreground mt-2 mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/login" className={buttonVariants({ variant: "default" })}>
        <ArrowLeft data-icon="inline-start" className="size-4" />
        Back to Portal
      </Link>
    </div>
  );
}
