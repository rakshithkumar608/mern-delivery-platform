import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import {
  ArrowLeft,
  CheckCircle2,
  Navigation,
  RefreshCw,
  RotateCcw,
  Save,
} from "lucide-react";
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
          text: "Delivery rules and payout settings updated successfully.",
          type: "success",
        });
        if (res.data.rules) setRules(res.data.rules);
      }
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to save delivery rules.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setRules(DEFAULT_RULES);
    setMessage({
      text: "Reset to default parameters. Click 'Save Changes' to apply.",
      type: "success",
    });
  };

  // Calculations
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827]">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Navigation Breadcrumb & Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium mb-2"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Overview</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              Delivery & Payout Rules
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Configure courier payouts, distance rates, and platform commission.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchRules}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Syncing..." : "Sync from DB"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`flex items-center gap-2.5 p-3.5 rounded-lg text-xs font-medium border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-[#00875A]"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <CheckCircle2 className="size-4 shrink-0 text-[#00875A]" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main Form */}
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {/* Courier Compensation Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Courier Earnings Settings
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Calculates rider payout per completed delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Base Courier Pay */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Base Pickup Pay ({rules.currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
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
                      className="h-9.5 w-full pl-8 pr-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#00875A] focus:outline-none transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Guaranteed pickup flat fee before distance
                  </span>
                </div>

                {/* Distance Rate per KM */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Distance Rate per KM ({rules.currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
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
                      className="h-9.5 w-full pl-8 pr-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#00875A] focus:outline-none transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Multiplied by routing distance
                  </span>
                </div>

                {/* Platform Commission */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Platform Commission Rate (%)
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
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
                          platformCommissionRate:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9.5 w-full pl-3 pr-8 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#00875A] focus:outline-none transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Platform share deducted from gross fee
                  </span>
                </div>

                {/* Minimum Floor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Minimum Payout Floor ({rules.currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
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
                      className="h-9.5 w-full pl-8 pr-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#00875A] focus:outline-none transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Driver will never earn below this floor
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Checkout Pricing */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Customer Checkout Settings
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Controls delivery fees added to customer basket and checkout.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Customer Delivery Fee ({rules.currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
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
                      className="h-9.5 w-full pl-8 pr-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#00875A] focus:outline-none transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Default checkout delivery charge
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Platform Currency Symbol
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={rules.currency}
                    onChange={(e) =>
                      setRules({ ...rules, currency: e.target.value })
                    }
                    className="h-9.5 w-full px-3 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#00875A] focus:outline-none transition-colors"
                  />
                  <span className="text-[11px] text-gray-400">
                    Display currency across all client apps
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00875A] hover:bg-[#00704A] text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="size-4" />
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </form>

          {/* Right Sidebar: Real-Time Payout Simulator (Exact Checkout Breakdown Reference) */}
          <aside className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5 h-fit">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Payout Breakdown Simulator
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Simulates real-time courier earnings on the mobile rider app.
              </p>
            </div>

            {/* Distance Slider */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium flex items-center gap-1.5">
                  <Navigation className="size-3 text-[#00875A]" />
                  Delivery Distance
                </span>
                <span className="font-semibold text-gray-900">
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
                className="w-full accent-[#00875A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0.5 km</span>
                <span>5.0 km</span>
                <span>10.0 km</span>
              </div>
            </div>

            {/* Receipt Summary Modeled after Mobile Checkout Screen */}
            <div className="border border-gray-100 rounded-lg p-3.5 bg-gray-50/70 flex flex-col gap-2.5 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Payout Ticket
              </span>

              <div className="flex justify-between text-gray-600">
                <span>Base Pickup Pay</span>
                <span className="font-medium text-gray-900">
                  {rules.currency}
                  {rules.driverBasePayout.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Distance Pay ({simDistance} km)</span>
                <span className="font-medium text-gray-900">
                  {rules.currency}
                  {simDistanceFee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Gross Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {rules.currency}
                  {simGrossPayout.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200">
                <span>Commission ({rules.platformCommissionRate}%)</span>
                <span className="text-gray-500 font-medium">
                  -{rules.currency}
                  {simCommissionFee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-semibold text-gray-900">
                  Net Driver Payout
                </span>
                <span className="text-lg font-bold text-[#00875A]">
                  {rules.currency}
                  {simNetPayout.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Customer Fee Display */}
            <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-white">
              <div>
                <span className="text-xs font-medium text-gray-900 block">
                  Customer Delivery Fee
                </span>
                <span className="text-[11px] text-gray-400">
                  Shown in app basket
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {rules.currency}
                {rules.customerDeliveryFee.toFixed(2)}
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
