import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { getApiErrorMessage } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Store,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import logoImg from "@/assets/logo-mark-teal.png";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login({ email: email.trim(), password });

      const from = (location.state as { from?: { pathname?: string } })?.from
        ?.pathname;
      if (from && from !== "/login") {
        navigate(from, { replace: true });
      } else if (user.role === "restaurant_owner") {
        navigate("/restaurant/dashboard", { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Decorative ambient glowing gradients */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-emerald-400/10 blur-[140px]" />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 backdrop-blur-md shadow-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Chowly Operations Suite
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-2 shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-500/20">
              <img
                src={logoImg}
                alt="Chowly"
                className="size-10 object-contain drop-shadow"
                onError={(e) => {
                  // Fallback if image fails
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <UtensilsCrossed className="size-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Chowly<span className="text-emerald-600">.</span>
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Admin & Kitchen Partner Console
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl">
          <CardHeader className="gap-1 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Enter your authorized credentials to manage platform operations.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-4 pt-5 pb-4">
              {error && (
                <Alert variant="destructive" className="border-red-300/80 bg-red-50/90 text-red-900 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle data-icon="inline-start" className="size-4" />
                  <AlertTitle className="text-xs font-semibold">Authentication Error</AlertTitle>
                  <AlertDescription className="text-xs mt-0.5">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@chowly.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 pl-10 pr-3 text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-emerald-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pl-10 pr-10 text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-emerald-500"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-1">
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-md shadow-emerald-600/25 transition-all active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 data-icon="inline-start" className="size-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Zap data-icon="inline-start" className="size-4 text-emerald-200" />
                    Sign In to Portal
                  </>
                )}
              </Button>

              {/* Seeded Quick-Login Shortcuts */}
              <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Quick Demo Credentials
                  </span>
                  <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    Click to Autofill
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Admin quick login button */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin@chowly.com", "Admin123!")}
                    className="group relative flex flex-col items-start gap-1 p-3 rounded-xl border border-emerald-500/25 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-left transition-all hover:border-emerald-500/60 hover:shadow-xs active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                        <div className="flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white">
                          <Shield className="size-3" />
                        </div>
                        Platform Admin
                      </div>
                      <Sparkles className="size-3 text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 truncate max-w-full">
                      admin@chowly.com
                    </span>
                  </button>

                  {/* Restaurant Partner quick login button */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("restaurant@chowly.com", "Partner123!")}
                    className="group relative flex flex-col items-start gap-1 p-3 rounded-xl border border-amber-500/25 bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-left transition-all hover:border-amber-500/60 hover:shadow-xs active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 dark:text-amber-200">
                        <div className="flex size-5 items-center justify-center rounded-md bg-amber-600 text-white">
                          <Store className="size-3" />
                        </div>
                        Restaurant Partner
                      </div>
                      <Sparkles className="size-3 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 truncate max-w-full">
                      restaurant@chowly.com
                    </span>
                  </button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Security / Status Micro Badge */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            256-bit Encrypted Session
          </span>
          <span>•</span>
          <span>RBAC Route Protection Active</span>
        </div>
      </div>
    </div>
  );
}
