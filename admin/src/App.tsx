import { useState, useEffect } from 'react';
import './App.css';

interface DeliveryRule {
  driverBasePayout: number;
  driverPerKmRate: number;
  driverMinPayout: number;
  customerBaseDeliveryFee: number;
  freeDeliveryThreshold: number;
  currency: string;
  updatedBy?: string;
  updatedAt?: string;
}

const DEFAULT_RULES: DeliveryRule = {
  driverBasePayout: 4.90,
  driverPerKmRate: 1.20,
  driverMinPayout: 5.00,
  customerBaseDeliveryFee: 1.49,
  freeDeliveryThreshold: 10.00,
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
  const [simCartTotal, setSimCartTotal] = useState<number>(14.50);

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
            customerBaseDeliveryFee: Number(data.rules.customerBaseDeliveryFee ?? 1.49),
            freeDeliveryThreshold: Number(data.rules.freeDeliveryThreshold ?? 10.00),
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
        setMessage({ text: 'Delivery and courier payout rules saved successfully! 🎉', type: 'success' });
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
  const simRawPayout = Number((rules.driverBasePayout + simDistanceFee).toFixed(2));
  const simTotalPayout = Math.max(rules.driverMinPayout, simRawPayout);
  const isCustomerFreeDelivery = simCartTotal >= rules.freeDeliveryThreshold;
  const customerCharge = isCustomerFreeDelivery ? 0 : rules.customerBaseDeliveryFee;

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
            Configure driver delivery payout rates (Base & Distance) and customer delivery fee policies.
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
          {/* Section 1: Courier Payout */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px' }}>🛵</span>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Driver Earnings & Payout Rates
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              These rates directly calculate what the rider earns for every completed delivery (shown as Base + Distance in the rider app).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Base Courier Payout ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={rules.driverBasePayout}
                  onChange={(e) => setRules({ ...rules, driverBasePayout: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Fixed rate per pickup</span>
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
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Floor threshold for short trips</span>
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

          {/* Section 2: Customer Delivery Fee */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px' }}>💳</span>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Customer Delivery Pricing
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              What customers are charged at checkout. When the basket reaches the threshold, customer delivery becomes FREE.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Standard Delivery Fee ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={rules.customerBaseDeliveryFee}
                  onChange={(e) => setRules({ ...rules, customerBaseDeliveryFee: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Charged when below threshold</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Free Delivery Basket Threshold ({rules.currency})
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={rules.freeDeliveryThreshold}
                  onChange={(e) => setRules({ ...rules, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 600, boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Subtotal needed for FREE delivery</span>
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
            Preview how rider earnings and customer fees compute in real time.
          </p>

          <div style={{ marginBottom: '14px' }}>
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              <span>Customer Cart:</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{rules.currency}{simCartTotal.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="3.0"
              max="25.0"
              step="0.5"
              value={simCartTotal}
              onChange={(e) => setSimCartTotal(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#00A876' }}
            />
          </div>

          {/* Rider Breakdown Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#007A5E', marginBottom: '8px' }}>
              Rider Sees (Payout):
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
              <span>Base Pay</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{rules.currency}{rules.driverBasePayout.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
              <span>Distance ({simDistance} km)</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{rules.currency}{simDistanceFee.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              <span>Total Rider Earns</span>
              <span style={{ color: '#007A5E', fontSize: '16px' }}>{rules.currency}{simTotalPayout.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Fee Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>
              Customer Pays:
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Delivery Fee:</span>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isCustomerFreeDelivery ? '#166534' : '#0f172a',
                backgroundColor: isCustomerFreeDelivery ? '#dcfce7' : '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '6px',
              }}>
                {isCustomerFreeDelivery ? 'FREE' : `${rules.currency}${customerCharge.toFixed(2)}`}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              {isCustomerFreeDelivery
                ? `Cart (${rules.currency}${simCartTotal}) >= Threshold (${rules.currency}${rules.freeDeliveryThreshold})`
                : `Add ${rules.currency}${(rules.freeDeliveryThreshold - simCartTotal).toFixed(2)} more for FREE delivery`}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
