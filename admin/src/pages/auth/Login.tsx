import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { getApiErrorMessage } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Store,
} from "lucide-react";
import logoImg from "@/assets/logo.png";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-4 sm:p-6 text-[#111827]">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        {/* Brand & Greeting */}
        <div className="flex flex-col items-center text-center">
          <img
            src={logoImg}
            alt="Chowly"
            className="h-8 w-auto object-contain mb-4"
          />
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Sign in to Operations Portal
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Access platform management, dispatch, and delivery rules.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="rounded-lg border-red-200 bg-red-50 text-red-800 text-xs py-2.5"
          >
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-gray-700"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@chowly.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-10 w-full pl-9 pr-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#00875A] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-medium text-gray-700"
              >
                Password
              </label>
              <span className="text-xs text-[#00875A] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-10 w-full pl-9 pr-9 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#00875A] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-10 w-full flex items-center justify-center rounded-lg bg-[#00875A] hover:bg-[#00704A] text-white text-sm font-medium shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Authenticating...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <span>Quick Demo Accounts</span>
            <span>Click to fill</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@chowly.com", "Admin123!")}
              className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100/80 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800">
                <Shield className="size-3 text-[#00875A]" />
                <span>Admin</span>
              </div>
              <span className="text-[11px] font-mono text-gray-500 block truncate mt-0.5">
                admin@chowly.com
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickLogin("restaurant@chowly.com", "Partner123!")
              }
              className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100/80 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800">
                <Store className="size-3 text-amber-600" />
                <span>Partner</span>
              </div>
              <span className="text-[11px] font-mono text-gray-500 block truncate mt-0.5">
                partner@chowly.com
              </span>
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center text-[11px] text-gray-400">
          Chowly Operations Platform • 256-bit Encrypted Session
        </div>
      </div>
    </div>
  );
}
