import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  Coins,
  LogOut,
  Navigation,
  Percent,
  Server,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import logoImg from "@/assets/logo-mark-teal.png";

export function AdminDashboardPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-sm ring-1 ring-emerald-500/20">
              <img
                src={logoImg}
                alt="Chowly"
                className="size-7 object-contain drop-shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <UtensilsCrossed className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Chowly Admin
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live System
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Operations & Platform Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs ring-1 ring-emerald-500/25">
                {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                  {user?.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.email}
                </span>
              </div>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-semibold text-[11px] capitalize px-2 py-0.5 shadow-xs">
                <ShieldCheck className="size-3 mr-1" />
                {user?.role}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void logout()}
              className="text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300 cursor-pointer"
            >
              <LogOut data-icon="inline-start" className="size-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 flex flex-col gap-8">
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-1.5 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Platform Operations Overview
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Platform authentication, session validation, and TanStack React Query cache are online. You have full access to configure commission rates, monitor dispatch, and manage restaurants.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/settings/delivery"
                className={buttonVariants({
                  className:
                    "bg-white hover:bg-slate-100 text-emerald-800 font-bold shadow-md cursor-pointer rounded-xl",
                })}
              >
                <Sliders data-icon="inline-start" className="size-4 text-emerald-700" />
                Commission & Payouts
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-12 -bottom-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute right-48 -top-12 size-48 rounded-full bg-teal-400/20 blur-xl" />
        </div>

        {/* Real-time KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Gross Sales */}
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Gross Volume (Today)
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Coins className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                £1,428.50
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600">
                <TrendingUp className="size-3.5" />
                <span>+14.2%</span>
                <span className="text-slate-400 font-normal">vs. yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Live Orders */}
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Live Orders
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <ShoppingBag className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                18 In Flight
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="size-1.5 rounded-full bg-indigo-500" />
                <span>9 cooking • 5 on the way</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Active Courier Fleet */}
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Fleet
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                <Navigation className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                24 Couriers
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="size-1.5 rounded-full bg-cyan-500" />
                <span>16 available • 8 delivering</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Platform Net Commission */}
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Platform Commission (15%)
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Percent className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                £214.28
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="size-3.5" />
                <span>Net retained earnings</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation & Operational Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick link: Delivery & Commission Rules */}
          <Card className="border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-xs lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Sliders className="size-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Delivery Rules & Commission Engine
                  </CardTitle>
                </div>
                <Badge className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300">
                  Ready to Configure
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Fine-tune driver base pay, mileage rates (£/km), platform commission deduction rate (15%), and customer checkout delivery pricing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/admin/settings/delivery"
                  className={buttonVariants({
                    className:
                      "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer",
                  })}
                >
                  Open Delivery Rules & Payout Simulator
                  <ArrowRight data-icon="inline-end" className="size-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security & Session Info */}
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-emerald-600" />
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Session Info
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Authenticated Role:</span>
                <span className="font-bold text-emerald-600 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Admin Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Cache Layer:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">TanStack Query</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">API Transport:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Axios + JWT Bearer</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
