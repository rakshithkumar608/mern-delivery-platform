import React, { useState, useEffect } from 'react';

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
  driverBasePayout: 4.90,
  driverPerKmRate: 1.20,
  driverMinPayout: 5.00,
  platformCommissionRate: 15,
  customerDeliveryFee: 1.49,
  currency: '£',
};

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : 'http://localhost:5000/api/v1';

export function DeliveryRulesPage() {
  const [rules, setRules] = useState<DeliveryRule>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Interactive Simulator state
  const [simDistance, setSimDistance] = useState<number>(2.5);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/delivery-rules`);
      if (res.ok) {
        const data = await res.json();
        if (data.rules) {
          setRules({
            driverBasePayout: Number(data.rules.driverBasePayout ?? 4.90),
            driverPerKmRate: Number(data.rules.driverPerKmRate ?? 1.20),
            driverMinPayout: Number(data.rules.driverMinPayout ?? 5.00),
            platformCommissionRate: Number(data.rules.platformCommissionRate ?? 15),
            customerDeliveryFee: Number(data.rules.customerDeliveryFee ?? data.rules.customerBaseDeliveryFee ?? 1.49),
            currency: data.rules.currency || '£',
            updatedBy: data.rules.updatedBy,
            updatedAt: data.rules.updatedAt,
          });
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/delivery-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Delivery and courier commission settings saved successfully! 🎉', type: 'success' });
        if (data.rules) setRules(data.rules);
      } else {
        setMessage({ text: data.message || 'Failed to save settings', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Cannot reach API server at ' + API_BASE, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setRules(DEFAULT_RULES);
    setMessage({ text: 'Reset to standard defaults. Click Save to apply to database.', type: 'success' });
  };

  // Simulator calculations
  const simDistanceFee = Number((simDistance * rules.driverPerKmRate).toFixed(2));
  const simGrossPayout = Number((rules.driverBasePayout + simDistanceFee).toFixed(2));
  const simCommissionFee = Number((simGrossPayout * (rules.platformCommissionRate / 100)).toFixed(2));
  const simNetRaw = Number((simGrossPayout - simCommissionFee).toFixed(2));
  const simNetPayout = Math.max(rules.driverMinPayout, simNetRaw);

  return (
    <div className="p-7 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b pb-5 mb-7">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🍔</span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Delivery & Commission Settings
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Platform Rules
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Configure driver payout rates (Base & Distance), platform commission percentage, and customer delivery pricing.
          </p>
        </div>

        <button
          onClick={fetchRules}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg border bg-background hover:bg-muted text-xs font-semibold text-foreground cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </header>

      {/* Notification Banner */}
      {message && (
        <div className={`p-3.5 rounded-lg mb-6 text-sm font-semibold border ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main Settings Form */}
        <form onSubmit={handleSave}>
          {/* Section 1: Courier Rates & Commission */}
          <div className="bg-card border rounded-xl p-5 mb-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3.5">
              <span className="text-lg">🛵</span>
              <h2 className="text-base font-bold text-foreground">
                Driver Earnings & Commission Settings
              </h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Configure what the courier earns per trip and the platform commission percentage deducted.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Base Courier Pay ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={rules.driverBasePayout}
                  onChange={(e) => setRules({ ...rules, driverBasePayout: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-semibold text-foreground"
                />
                <span className="text-[11px] text-muted-foreground">Fixed base per pickup</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Distance Rate per km ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={rules.driverPerKmRate}
                  onChange={(e) => setRules({ ...rules, driverPerKmRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-semibold text-foreground"
                />
                <span className="text-[11px] text-muted-foreground">Multiplied by trip distance</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-700 dark:text-amber-500 mb-1.5">
                  Platform Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={rules.platformCommissionRate}
                  onChange={(e) => setRules({ ...rules, platformCommissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-amber-500 bg-background text-sm font-bold text-amber-700 dark:text-amber-500"
                />
                <span className="text-[11px] text-amber-600 dark:text-amber-400">Commission retained by platform</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Minimum Guaranteed Payout ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={rules.driverMinPayout}
                  onChange={(e) => setRules({ ...rules, driverMinPayout: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-semibold text-foreground"
                />
                <span className="text-[11px] text-muted-foreground">Guaranteed floor after commission</span>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Delivery Fee */}
          <div className="bg-card border rounded-xl p-5 mb-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3.5">
              <span className="text-lg">💳</span>
              <h2 className="text-base font-bold text-foreground">
                Customer Delivery Pricing
              </h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Standard delivery fee charged to customers at checkout.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Customer Delivery Fee ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={rules.customerDeliveryFee}
                  onChange={(e) => setRules({ ...rules, customerDeliveryFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-semibold text-foreground"
                />
                <span className="text-[11px] text-muted-foreground">Standard checkout delivery fee</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Platform Currency Symbol
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={rules.currency}
                  onChange={(e) => setRules({ ...rules, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-semibold text-foreground"
                />
                <span className="text-[11px] text-muted-foreground">e.g. £, $, or ₹</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save & Apply Settings'}
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="bg-muted hover:bg-muted/80 text-foreground border rounded-lg px-4 py-2.5 text-xs font-semibold cursor-pointer"
            >
              Reset Defaults
            </button>
          </div>
        </form>

        {/* Live Simulator Sidebar */}
        <aside className="bg-muted/30 border rounded-xl p-5 h-fit">
          <h3 className="text-sm font-bold text-foreground mb-1">
            ⚡ Live Payout Simulator
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Real-time breakdown of courier gross, platform commission, and net payout.
          </p>

          <div className="mb-4">
            <label className="flex justify-between text-xs font-semibold text-foreground mb-1">
              <span>Trip Distance:</span>
              <span className="text-primary font-bold">{simDistance.toFixed(1)} km</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.1"
              value={simDistance}
              onChange={(e) => setSimDistance(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Rider Breakdown Card */}
          <div className="bg-card border rounded-lg p-3.5 mb-3 shadow-xs">
            <div className="text-[11px] font-bold uppercase text-primary mb-2.5">
              Driver App Breakdown:
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Base Pay</span>
              <span className="font-semibold text-foreground">{rules.currency}{rules.driverBasePayout.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Distance ({simDistance} km)</span>
              <span className="font-semibold text-foreground">{rules.currency}{simDistanceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Gross Earnings</span>
              <span>{rules.currency}{simGrossPayout.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-amber-700 dark:text-amber-500 mb-2">
              <span>Platform Comm. ({rules.platformCommissionRate}%)</span>
              <span className="font-semibold">-{rules.currency}{simCommissionFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-bold text-foreground">
              <span>Net Rider Payout</span>
              <span className="text-primary text-base">{rules.currency}{simNetPayout.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Fee Card */}
          <div className="bg-card border rounded-lg p-3 shadow-xs">
            <div className="text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
              Customer Checkout Fee:
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Delivery Fee:</span>
              <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                {rules.currency}{rules.customerDeliveryFee.toFixed(2)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
