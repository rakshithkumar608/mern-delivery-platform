import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  ArrowLeft,
  CheckCircle2,
  Coins,
  CreditCard,
  Navigation,
  Percent,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import logoImg from "@/assets/logo-mark-teal.png";
import API from "@/lib/axios-client";

interface DeliveryRule {
  driverBasePayout: number;
  driverPerKmRate: number;
  driverMinPayout: number;
  platformCommissionRate: number;
  customerDeliveryFee: number;
  currency: string;
  updatedBy?: string;
  updatedAt?: string;
}

const DEFAULT_RULES: DeliveryRule = {
  driverBasePayout: 4.9,
  driverPerKmRate: 1.2,
  driverMinPayout: 5.0,
  platformCommissionRate: 15,
  customerDeliveryFee: 1.49,
  currency: "£",
};

export function DeliveryRulesPage() {
  const [rules, setRules] = useState<DeliveryRule>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Interactive Simulator state
  const [simDistance, setSimDistance] = useState<number>(2.5);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await API.get("/delivery-rules");
      if (res.data?.rules) {
        setRules({
          driverBasePayout: Number(res.data.rules.driverBasePayout ?? 4.9),
          driverPerKmRate: Number(res.data.rules.driverPerKmRate ?? 1.2),
          driverMinPayout: Number(res.data.rules.driverMinPayout ?? 5.0),
          platformCommissionRate: Number(
            res.data.rules.platformCommissionRate ?? 15
          ),
          customerDeliveryFee: Number(
            res.data.rules.customerDeliveryFee ??
              res.data.rules.customerBaseDeliveryFee ??
              1.49
          ),
          currency: res.data.rules.currency || "£",
          updatedBy: res.data.rules.updatedBy,
          updatedAt: res.data.rules.updatedAt,
        });
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRules();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await API.put("/delivery-rules", rules);
      if (res.data) {
        setMessage({
          text: "Delivery pricing & courier commission settings saved successfully! 🎉",
          type: "success",
        });
        if (res.data.rules) setRules(res.data.rules);
      }
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to save delivery rules",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setRules(DEFAULT_RULES);
    setMessage({
      text: "Reset to standard defaults. Click Save to apply to database.",
      type: "success",
    });
  };

  // Simulator calculations
  const simDistanceFee = Number((simDistance * rules.driverPerKmRate).toFixed(2));
  const simGrossPayout = Number(
    (rules.driverBasePayout + simDistanceFee).toFixed(2)
  );
  const simCommissionFee = Number(
    (simGrossPayout * (rules.platformCommissionRate / 100)).toFixed(2)
  );
  const simNetRaw = Number((simGrossPayout - simCommissionFee).toFixed(2));
  const simNetPayout = Math.max(rules.driverMinPayout, simNetRaw);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "rounded-lg text-xs font-semibold gap-1.5",
              })}
            >
              <ArrowLeft data-icon="inline-start" className="size-4" />
              Dashboard
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xs">
                <img
                  src={logoImg}
                  alt="Chowly"
                  className="size-5 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
                <UtensilsCrossed className="size-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                Delivery & Commission Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRules}
              disabled={loading}
              className="text-xs font-semibold rounded-lg gap-1.5"
            >
              <RefreshCw
                data-icon="inline-start"
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
        {/* Banner */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Platform Delivery & Courier Rates
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
              Live Config
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure courier earnings (Base + Mileage rate), platform commission rate, and customer delivery pricing.
          </p>
        </div>

        {/* Message notification */}
        {message && (
          <div
            className={`flex items-center gap-2.5 p-4 rounded-xl text-sm font-semibold border ${
              message.type === "success"
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-red-50/80 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
            }`}
          >
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Main Configuration Form */}
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {/* Courier Section Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Coins className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">
                        Driver Earnings & Commission Settings
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Controls what the courier sees and earns per delivery.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    Live Payout Formula
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5">
                {/* Base Courier Pay */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Base Courier Pay ({rules.currency})
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {rules.currency}
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={rules.driverBasePayout}
                      onChange={(e) =>
                        setRules({
                          ...rules,
                          driverBasePayout: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-10 w-full pl-8 pr-3 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Guaranteed base payment for pickup
                  </span>
                </div>

                {/* Per-Km Rate */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Distance Rate per km ({rules.currency})
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {rules.currency}
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={rules.driverPerKmRate}
                      onChange={(e) =>
                        setRules({
                          ...rules,
                          driverPerKmRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-10 w-full pl-8 pr-3 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Multiplied by estimated trip distance
                  </span>
                </div>

                {/* Platform Commission Rate */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Percent className="size-3.5" />
                    Platform Commission Rate (%)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-600">
                      %
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={rules.platformCommissionRate}
                      onChange={(e) =>
                        setRules({
                          ...rules,
                          platformCommissionRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-10 w-full px-3 pr-8 text-sm font-extrabold text-amber-700 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 focus:outline-amber-500"
                    />
                  </div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400">
                    Deducted from gross fee per completed delivery
                  </span>
                </div>

                {/* Minimum Payout Floor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Minimum Guaranteed Payout ({rules.currency})
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {rules.currency}
                    </span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={rules.driverMinPayout}
                      onChange={(e) =>
                        setRules({
                          ...rules,
                          driverMinPayout: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-10 w-full pl-8 pr-3 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Driver will never earn below this threshold
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Fee Section Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">
                      Customer Delivery Pricing
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Controls delivery fees applied on customer basket and checkout.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Customer Delivery Fee ({rules.currency})
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {rules.currency}
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={rules.customerDeliveryFee}
                      onChange={(e) =>
                        setRules({
                          ...rules,
                          customerDeliveryFee: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-10 w-full pl-8 pr-3 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Standard delivery charge shown to customers
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={rules.currency}
                    onChange={(e) => setRules({ ...rules, currency: e.target.value })}
                    className="h-10 w-full px-3 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">
                    Symbol used across entire platform (e.g. £, $, €)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Save data-icon="inline-start" className="size-4" />
                {saving ? "Saving Changes..." : "Save & Apply Settings"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResetDefaults}
                className="h-11 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <RotateCcw data-icon="inline-start" className="size-3.5" />
                Reset Defaults
              </Button>
            </div>
          </form>

          {/* Live Simulator Sidebar */}
          <aside className="flex flex-col gap-5">
            <Card className="border border-emerald-500/30 bg-white dark:bg-slate-900 shadow-md">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Zap className="size-3.5" />
                  </div>
                  <CardTitle className="text-sm font-bold">
                    Live Payout Simulator
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Slide distance to simulate live driver earnings.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 pt-4">
                {/* Distance Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Navigation className="size-3 text-emerald-600" />
                      Trip Distance:
                    </span>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      {simDistance.toFixed(1)} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.1"
                    value={simDistance}
                    onChange={(e) => setSimDistance(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.5 km</span>
                    <span>5.0 km</span>
                    <span>10.0 km</span>
                  </div>
                </div>

                {/* Driver App Payout Breakdown */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    <span>Driver App Screen</span>
                    <ShieldCheck className="size-3.5" />
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Base Pickup Pay</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rules.currency}
                      {rules.driverBasePayout.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Distance Pay ({simDistance} km)</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rules.currency}
                      {simDistanceFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Gross Fare</span>
                    <span className="font-semibold">
                      {rules.currency}
                      {simGrossPayout.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span>Platform Commission ({rules.platformCommissionRate}%)</span>
                    <span>
                      -{rules.currency}
                      {simCommissionFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                      Net Driver Payout
                    </span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {rules.currency}
                      {simNetPayout.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer Checkout Fee Card */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300">
                      Customer Pays
                    </span>
                    <span className="text-xs text-slate-500">
                      Standard Checkout Fee
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-blue-900 dark:text-blue-200">
                    {rules.currency}
                    {rules.customerDeliveryFee.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
