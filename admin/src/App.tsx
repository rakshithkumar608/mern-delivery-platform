import { useState, useEffect } from 'react';
import './App.css';

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

const API_BASE = 'http://localhost:5000/api/v1';

export default function App() {
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
    <div style={{ padding: '28px 24px', maxWidth: '960px', margin: '0 auto', textAlign: 'left', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🍔</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              Chowly Admin
            </h1>
            <span style={{ backgroundColor: '#ecfdf5', color: '#007A5E', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              Platform Settings
            </span>
          </div>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
            Configure driver payout rates (Base & Distance), platform commission percentage, and customer delivery pricing.
          </p>
        </div>

        <button
          onClick={fetchRules}
          disabled={loading}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569' }}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </header>

      {/* Notification Banner */}
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 600,
          backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Main Settings Form */}
        <form onSubmit={handleSave}>
          {/* Section 1: Courier Rates & Commission */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px' }}>🛵</span>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Driver Earnings & Commission Settings
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Configure what the courier earns per trip and the platform commission percentage deducted.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Base Courier Pay ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={rules.driverBasePayout}
                  onChange={(e) => setRules({ ...rules, driverBasePayout: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Fixed base per pickup</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Distance Rate per km ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={rules.driverPerKmRate}
                  onChange={(e) => setRules({ ...rules, driverPerKmRate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Multiplied by trip distance</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#b45309', marginBottom: '6px' }}>
                  Platform Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={rules.platformCommissionRate}
                  onChange={(e) => setRules({ ...rules, platformCommissionRate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f59e0b', fontSize: '15px', fontWeight: 700, color: '#b45309', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#b45309' }}>Commission retained by platform</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Minimum Guaranteed Payout ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={rules.driverMinPayout}
                  onChange={(e) => setRules({ ...rules, driverMinPayout: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Guaranteed floor after commission</span>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Delivery Fee */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px' }}>💳</span>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Customer Delivery Pricing
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Standard delivery fee charged to customers at checkout.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Customer Delivery Fee ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={rules.customerDeliveryFee}
                  onChange={(e) => setRules({ ...rules, customerDeliveryFee: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Standard checkout delivery fee</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Platform Currency Symbol
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={rules.currency}
                  onChange={(e) => setRules({ ...rules, currency: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>e.g. £, $, or ₹</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: '#00A876',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 168, 118, 0.25)',
              }}
            >
              {saving ? 'Saving Changes...' : 'Save & Apply Settings'}
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset Defaults
            </button>
          </div>
        </form>

        {/* Live Simulator Sidebar */}
        <aside style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
            ⚡ Live Payout Simulator
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>
            Real-time breakdown of courier gross, platform commission, and net payout.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              <span>Trip Distance:</span>
              <span style={{ color: '#007A5E', fontWeight: 700 }}>{simDistance.toFixed(1)} km</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.1"
              value={simDistance}
              onChange={(e) => setSimDistance(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#00A876' }}
            />
          </div>

          {/* Rider Breakdown Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#007A5E', marginBottom: '10px' }}>
              Driver App Breakdown:
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
              <span>Base Pay</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{rules.currency}{rules.driverBasePayout.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
              <span>Distance ({simDistance} km)</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{rules.currency}{simDistanceFee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>Gross Earnings</span>
              <span>{rules.currency}{simGrossPayout.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#b45309', marginBottom: '8px' }}>
              <span>Platform Comm. ({rules.platformCommissionRate}%)</span>
              <span style={{ fontWeight: 600 }}>-{rules.currency}{simCommissionFee.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              <span>Net Rider Payout</span>
              <span style={{ color: '#007A5E', fontSize: '16px' }}>{rules.currency}{simNetPayout.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Fee Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
              Customer Checkout Fee:
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Delivery Fee:</span>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                backgroundColor: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '6px',
              }}>
                {rules.currency}{rules.customerDeliveryFee.toFixed(2)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
