import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { getApiErrorMessage } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import loginBgImg from "@/assets/login-bg-img.png";
import logoImg from "@/assets/logo.png";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#006754] font-sans antialiased selection:bg-[#006754] selection:text-white lg:overflow-hidden">
      {/* SVG clip-path definition for food hero arch */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="hero-curve" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.14 C 0.35,0.01 0.7,0 1,0.05 L 1,1 L 0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* LEFT COLUMN: Chowly Operations Hero & Brand Showcase */}
      <div className="w-full lg:w-1/2 bg-[#006754] flex flex-col justify-between relative overflow-hidden text-white min-h-140 lg:h-full">
        {/* Top: Logo & Nav */}
        <div className="relative z-10 px-8 pt-8 sm:px-12 sm:pt-10 lg:px-12 lg:pt-10 xl:px-16 xl:pt-12">
          <div className="flex items-center">
            <img
              src={logoImg}
              alt="Chowly"
              className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
            />
          </div>

          {/* Heading Content */}
          <div className="mt-8 sm:mt-10 lg:mt-10 max-w-xl">
            <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#34d399] uppercase mb-3">
              CHOWLY OPERATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[44px] font-extrabold text-white tracking-tight leading-[1.12] mb-3">
              Everything your<br />delivery network needs.
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-emerald-100/80 font-normal leading-relaxed max-w-lg">
              Manage orders, restaurants, riders and<br className="hidden sm:inline" /> customers from one place.
            </p>
          </div>
        </div>

        {/* Center / Image Container spanning full width to the edge */}
        <div className="relative w-full flex-1 overflow-hidden min-h-55 my-2">
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: "url(#hero-curve)" }}
          >
            <img
              src={loginBgImg}
              alt="Chowly Food Experience"
              className="w-full h-full object-cover object-bottom select-none"
            />
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 px-8 pb-6 sm:px-12 sm:pb-8 lg:px-12 xl:px-16 pt-2 flex items-center justify-between text-white/90">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium text-white tracking-tight">
              Live orders
            </span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <Lock className="size-3.5 sm:size-4 text-white" />
            <span className="text-xs sm:text-sm font-medium text-white tracking-tight">
              Secure access
            </span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <BarChart3 className="size-3.5 sm:size-4 text-white" />
            <span className="text-xs sm:text-sm font-medium text-white tracking-tight">
              Real-time updates
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-10 lg:px-12 xl:px-20 min-h-screen lg:h-full lg:overflow-y-auto">
        <div className="w-full max-w-105 mx-auto my-auto flex flex-col py-2">
          {/* Eyebrow & Titles */}
          <div className="mb-7">
            <span className="text-xs font-bold tracking-[0.16em] text-[#006754] uppercase block mb-2.5">
              ADMIN PORTAL
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-normal">
              Sign in to manage Chowly operations.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-5 rounded-xl border-red-200 bg-red-50 text-red-800 text-xs py-3"
            >
              <AlertCircle className="size-4 shrink-0" />
              <AlertDescription className="text-xs font-medium ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-900"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="size-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 stroke-[1.75]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@chowly.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 w-full pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 bg-white border border-gray-200 rounded-xl focus:border-[#006754] focus:ring-2 focus:ring-[#006754]/15 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-900"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="size-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 stroke-[1.75]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 w-full pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 bg-white border border-gray-200 rounded-xl focus:border-[#006754] focus:ring-2 focus:ring-[#006754]/15 focus:outline-none transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-5 stroke-[1.75]" />
                  ) : (
                    <Eye className="size-5 stroke-[1.75]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`size-4.5 rounded-[5px] flex items-center justify-center transition-all ${
                    rememberMe
                      ? "bg-[#006754] text-white"
                      : "border border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  {rememberMe && <Check className="size-3.5 stroke-3" />}
                </div>
                <span
                  onClick={() => setRememberMe(!rememberMe)}
                  className="text-sm text-gray-600 font-medium cursor-pointer"
                >
                  Remember me
                </span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset instructions will be sent to your registered email address.");
                }}
                className="text-sm font-semibold text-[#007a60] hover:text-[#006754] hover:underline transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full flex items-center justify-center rounded-xl bg-[#007a60] hover:bg-[#006754] active:bg-[#005a49] text-white text-base font-semibold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Protected Admin Access Badge */}
          <div className="flex flex-col items-center gap-3 mt-6">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <ShieldCheck className="size-4 stroke-[1.75] text-gray-400" />
              <span>Protected admin access</span>
            </div>

            {/* Quick Demo Autofill Pills */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@chowly.com", "Admin123!")}
                className="text-[11px] font-medium text-gray-500 hover:text-[#006754] bg-gray-50 hover:bg-gray-100 border border-gray-200/60 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                Fill Admin
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin("restaurant@chowly.com", "Partner123!")
                }
                className="text-[11px] font-medium text-gray-500 hover:text-[#006754] bg-gray-50 hover:bg-gray-100 border border-gray-200/60 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                Fill Partner
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-right text-xs text-gray-400 pt-2">
          © 2026 Chowly
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
