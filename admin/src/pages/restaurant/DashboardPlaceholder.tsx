import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  CheckCircle2,
  ChefHat,
  Coins,
  Flame,
  LogOut,
  ShoppingBag,
  Store,
} from "lucide-react";
import logoImg from "@/assets/logo-mark-teal.png";

export function RestaurantDashboardPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm ring-1 ring-amber-500/20">
              <img
                src={logoImg}
                alt="Chowly"
                className="size-7 object-contain drop-shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <ChefHat className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Chowly Kitchen Display
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Kitchen Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Restaurant Partner Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs ring-1 ring-amber-500/25">
                {user?.name?.slice(0, 2).toUpperCase() ?? "RO"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                  {user?.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.email}
                </span>
              </div>
              <Badge className="bg-amber-600 hover:bg-amber-600 text-white font-semibold text-[11px] capitalize px-2 py-0.5 shadow-xs">
                <Store className="size-3 mr-1" />
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-8 text-white shadow-xl shadow-amber-950/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-1.5 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Kitchen Orders & Terminal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}! 🍳
              </h1>
              <p className="text-sm text-amber-100 leading-relaxed">
                Your restaurant account is authenticated and route-guarded. Real-time incoming orders with audio alerts and live preparation tickets will stream here once Phase 6 is connected.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-sm font-bold">
                <Bell className="size-4 animate-bounce text-amber-200" />
                <span>Audio Alert: Armed</span>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-12 -bottom-16 size-64 rounded-full bg-white/10 blur-2xl" />
        </div>

        {/* Kitchen Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Incoming Orders
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                <ShoppingBag className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                3 Pending
              </div>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                Awaiting kitchen acceptance
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cooking on Line
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600">
                <Flame className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                5 In Prep
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Avg. prep time: 14 mins
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ready for Courier
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-emerald-600">
                2 Packed
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Waiting for courier arrival
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today's Sales
              </CardTitle>
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600">
                <Coins className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                £412.80
              </div>
              <p className="text-xs text-slate-500 mt-1">
                19 fulfilled orders today
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
